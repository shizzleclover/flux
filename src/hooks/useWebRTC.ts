'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useSocket } from './useSocket';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        // Google STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Free TURN servers from Open Relay (Metered.ca) - 20GB/month free
        {
            urls: 'turn:a.relay.metered.ca:80',
            username: 'e8dd65b92f6067e5bce6f645',
            credential: 'uWdWNmkhvyqTEuSN',
        },
        {
            urls: 'turn:a.relay.metered.ca:80?transport=tcp',
            username: 'e8dd65b92f6067e5bce6f645',
            credential: 'uWdWNmkhvyqTEuSN',
        },
        {
            urls: 'turn:a.relay.metered.ca:443',
            username: 'e8dd65b92f6067e5bce6f645',
            credential: 'uWdWNmkhvyqTEuSN',
        },
        {
            urls: 'turns:a.relay.metered.ca:443?transport=tcp',
            username: 'e8dd65b92f6067e5bce6f645',
            credential: 'uWdWNmkhvyqTEuSN',
        },
    ],
    iceCandidatePoolSize: 10,
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
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'new'>('new');
    const [peerId, setPeerId] = useState<string | null>(null);

    const createPeerConnection = useCallback((localStream: MediaStream): RTCPeerConnection => {
        console.log('🔗 Creating peer connection');

        const pc = new RTCPeerConnection(ICE_SERVERS);

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

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && peerId) {
                console.log('🔗 Sending ICE candidate');
                emit('ice-candidate', {
                    candidate: event.candidate.toJSON(),
                    targetId: peerId,
                });
            }
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
        const peerToUse = targetPeerId || peerId;
        if (!peerToUse) {
            console.error('🔗 No peer ID set');
            return;
        }

        const pc = createPeerConnection(localStream);

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
        if (!peerId) {
            console.error('🔗 No peer ID set');
            return;
        }

        const pc = createPeerConnection(localStream);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));

            // Process any queued ICE candidates
            while (iceCandidateQueueRef.current.length > 0) {
                const candidate = iceCandidateQueueRef.current.shift()!;
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log('🔗 Sending answer to', peerId);
            emit('answer', {
                sdp: answer,
                targetId: peerId,
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
