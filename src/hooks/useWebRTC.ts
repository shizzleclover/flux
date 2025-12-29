'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useSocket } from './useSocket';

// Fallback STUN-only config (works on LAN, may fail across NAT)
const FALLBACK_ICE_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
};

// Fetch TURN credentials from backend (Cloudflare Calls)
const fetchIceServers = async (): Promise<RTCConfiguration> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/turn/credentials`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('🔗 ICE servers loaded:', data.iceServers?.length || 0, 'servers');

        return {
            iceServers: data.iceServers,
            iceCandidatePoolSize: 10,
        };
    } catch (error) {
        console.warn('🔗 Failed to fetch TURN credentials, using STUN fallback:', error);
        return FALLBACK_ICE_CONFIG;
    }
};

interface UseWebRTCReturn {
    remoteStream: MediaStream | null;
    connectionState: RTCPeerConnectionState | 'new';
    peerId: string | null;
    createOffer: (localStream: MediaStream, targetPeerId?: string) => Promise<void>;
    handleOffer: (sdp: RTCSessionDescriptionInit, localStream: MediaStream) => Promise<void>;
    handleAnswer: (sdp: RTCSessionDescriptionInit) => Promise<void>;
    handleIceCandidate: (candidate: RTCIceCandidateInit) => void;
    closeConnection: () => void;
    setPeerId: (id: string | null) => void;
}

export function useWebRTC(): UseWebRTCReturn {
    const { emit } = useSocket();
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
    const iceConfigRef = useRef<RTCConfiguration | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'new'>('new');
    const [peerId, setPeerId] = useState<string | null>(null);

    // Use a ref to access the current peerId inside callbacks (prevents stale closure issues)
    const peerIdRef = useRef<string | null>(null);
    useEffect(() => {
        peerIdRef.current = peerId;
    }, [peerId]);

    // Pre-fetch ICE config on mount
    useEffect(() => {
        fetchIceServers().then(config => {
            iceConfigRef.current = config;
        });
    }, []);

    const createPeerConnection = useCallback(async (localStream: MediaStream): Promise<RTCPeerConnection> => {
        console.log('🔗 Creating peer connection');

        // Get ICE config (use cached or fetch fresh)
        const iceConfig = iceConfigRef.current || await fetchIceServers();
        iceConfigRef.current = iceConfig;

        const pc = new RTCPeerConnection(iceConfig);

        // Add local tracks to the connection
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });

        // Handle incoming remote stream
        pc.ontrack = (event) => {
            console.log('🔗 Remote track received', {
                kind: event.track.kind,
                streamId: event.streams[0]?.id,
                tracks: event.streams[0]?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled }))
            });
            if (event.streams[0]) {
                setRemoteStream(prevStream => {
                    // Only update if it's a new stream or the stream ID changed
                    if (!prevStream || prevStream.id !== event.streams[0].id) {
                        console.log('🔗 Setting new remote stream', event.streams[0].id);
                        return event.streams[0];
                    }
                    console.log('🔗 Stream already set, skipping update');
                    return prevStream;
                });
            }
        };

        // Handle ICE candidates with type logging
        pc.onicecandidate = (event) => {
            const currentPeerId = peerIdRef.current;
            if (event.candidate) {
                // Log candidate type for debugging (host/srflx/relay)
                const candidateType = event.candidate.type || 'unknown';
                console.log(`🔗 ICE candidate: type=${candidateType}, protocol=${event.candidate.protocol}`);

                if (currentPeerId) {
                    emit('ice-candidate', {
                        candidate: event.candidate.toJSON(),
                        targetId: currentPeerId,
                    });
                } else {
                    console.warn('🔗 ICE candidate generated but no peerId found');
                }
            }
        };

        // Log ICE gathering state
        pc.onicegatheringstatechange = () => {
            console.log('🔗 ICE gathering state:', pc.iceGatheringState);
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log('🔗 Connection state:', pc.connectionState);
            setConnectionState(pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
            console.log('🔗 ICE connection state:', pc.iceConnectionState);
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [emit, peerId]);

    const createOffer = useCallback(async (localStream: MediaStream, targetPeerId?: string): Promise<void> => {
        // Use the explicitly passed targetPeerId if provided; otherwise fall back to stored peerId
        const peerToUse = targetPeerId ?? peerIdRef.current;
        if (!peerToUse) {
            console.error('🔗 No peer ID set for offer');
            return;
        }

        const pc = await createPeerConnection(localStream);

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log('🔗 Sending offer to', peerToUse);
            emit('offer', {
                sdp: offer,
                targetId: peerToUse,
            });
        } catch (err) {
            console.error('🔗 Error creating offer:', err);
        }
    }, [createPeerConnection, emit, peerId]);

    const handleOffer = useCallback(async (
        sdp: RTCSessionDescriptionInit,
        localStream: MediaStream
    ): Promise<void> => {
        const currentPeerId = peerIdRef.current;
        if (!currentPeerId) {
            console.error('🔗 No peer ID set');
            return;
        }

        const pc = await createPeerConnection(localStream);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));

            // Process any queued ICE candidates
            while (iceCandidateQueueRef.current.length > 0) {
                const candidate = iceCandidateQueueRef.current.shift()!;
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log('🔗 Sending answer to', currentPeerId);
            emit('answer', {
                sdp: answer,
                targetId: currentPeerId,
            });
        } catch (err) {
            console.error('🔗 Error handling offer:', err);
        }
    }, [createPeerConnection, emit, peerId]);

    const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit): Promise<void> => {
        const pc = peerConnectionRef.current;
        if (!pc) {
            console.error('🔗 No peer connection');
            return;
        }

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));

            // Process any queued ICE candidates
            while (iceCandidateQueueRef.current.length > 0) {
                const candidate = iceCandidateQueueRef.current.shift()!;
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (err) {
            console.error('🔗 Error handling answer:', err);
        }
    }, []);

    const handleIceCandidate = useCallback((candidate: RTCIceCandidateInit): void => {
        const pc = peerConnectionRef.current;

        if (pc?.remoteDescription) {
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => {
                console.error('🔗 Error adding ICE candidate:', err);
            });
        } else {
            // Queue the candidate if remote description isn't set yet
            iceCandidateQueueRef.current.push(candidate);
        }
    }, []);

    const closeConnection = useCallback((): void => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setRemoteStream(null);
        setConnectionState('new');
        setPeerId(null);
        iceCandidateQueueRef.current = [];
        console.log('🔗 Connection closed');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            closeConnection();
        };
    }, [closeConnection]);

    return {
        remoteStream,
        connectionState,
        peerId,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        closeConnection,
        setPeerId,
    };
}
