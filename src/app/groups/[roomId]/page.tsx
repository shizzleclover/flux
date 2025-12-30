'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSocket, useMediaStream } from '@/hooks';
import { VideoPlayer } from '@/components';

interface PeerConnection {
    peerId: string;
    pc: RTCPeerConnection;
    stream: MediaStream | null;
}

export default function GroupRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const { socket, isConnected, emit, on, off } = useSocket();
    const { localStream, isVideoEnabled, isAudioEnabled, error: mediaError, startMedia, stopMedia, toggleVideo, toggleAudio } = useMediaStream();

    const [roomName, setRoomName] = useState('');
    const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
    const [isJoining, setIsJoining] = useState(true);

    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Map<string, PeerConnection>>(new Map());

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    useEffect(() => {
        peersRef.current = peers;
    }, [peers]);

    const fetchIceServers = async (): Promise<RTCConfiguration> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flux-be-production.up.railway.app';
            const res = await fetch(`${apiUrl}/api/turn/credentials`);
            const data = await res.json();
            return { iceServers: data.iceServers || [{ urls: 'stun:stun.l.google.com:19302' }] };
        } catch {
            return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        }
    };

    const createPeerConnection = useCallback(async (peerId: string, isInitiator: boolean) => {
        console.log(`Creating peer connection with ${peerId}, initiator: ${isInitiator}`);

        const config = await fetchIceServers();
        const pc = new RTCPeerConnection(config);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        pc.ontrack = (event) => {
            console.log(`Received track from ${peerId}`);
            const [remoteStream] = event.streams;

            setPeers(prev => {
                const updated = new Map(prev);
                const existing = updated.get(peerId);
                if (existing) {
                    existing.stream = remoteStream;
                    updated.set(peerId, { ...existing });
                }
                return updated;
            });
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                emit('room-ice-candidate', { targetId: peerId, candidate: event.candidate, roomId });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}: ${pc.connectionState}`);
        };

        const peerData: PeerConnection = { peerId, pc, stream: null };
        setPeers(prev => new Map(prev).set(peerId, peerData));
        peersRef.current.set(peerId, peerData);

        if (isInitiator) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emit('room-offer', { targetId: peerId, sdp: offer, roomId });
            } catch (err) {
                console.error('Error creating offer:', err);
            }
        }

        return pc;
    }, [emit, roomId]);

    useEffect(() => {
        const init = async () => {
            const stream = await startMedia();
            if (stream && isConnected) {
                emit('join-room', { roomId });
            }
        };

        if (isConnected) {
            init();
        }

        return () => {
            emit('leave-room', { roomId });
            peersRef.current.forEach(peer => peer.pc.close());
            stopMedia();
        };
    }, [isConnected, roomId, emit, startMedia, stopMedia]);

    useEffect(() => {
        if (!socket) return;

        const handleRoomUsers = async ({ users, roomName: name }: { users: string[]; roomName: string }) => {
            setRoomName(name);
            setIsJoining(false);
            for (const peerId of users) {
                await createPeerConnection(peerId, true);
            }
        };

        const handleUserJoined = async ({ socketId }: { socketId: string }) => {
            console.log('User joined:', socketId);
        };

        const handleUserLeft = ({ socketId }: { socketId: string }) => {
            const peer = peersRef.current.get(socketId);
            if (peer) {
                peer.pc.close();
                setPeers(prev => {
                    const updated = new Map(prev);
                    updated.delete(socketId);
                    return updated;
                });
                peersRef.current.delete(socketId);
            }
        };

        const handleRoomOffer = async ({ sdp, senderId }: { sdp: RTCSessionDescriptionInit; senderId: string }) => {
            const pc = await createPeerConnection(senderId, false);
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                emit('room-answer', { targetId: senderId, sdp: answer, roomId });
            } catch (err) {
                console.error('Error handling offer:', err);
            }
        };

        const handleRoomAnswer = async ({ sdp, senderId }: { sdp: RTCSessionDescriptionInit; senderId: string }) => {
            const peer = peersRef.current.get(senderId);
            if (peer) {
                await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
            }
        };

        const handleRoomIceCandidate = async ({ candidate, senderId }: { candidate: RTCIceCandidateInit; senderId: string }) => {
            const peer = peersRef.current.get(senderId);
            if (peer && candidate) {
                await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        const handleRoomError = ({ message }: { message: string }) => {
            alert(message);
            router.push('/groups');
        };

        on('room-users', handleRoomUsers);
        on('user-joined-room', handleUserJoined);
        on('user-left-room', handleUserLeft);
        on('room-offer', handleRoomOffer);
        on('room-answer', handleRoomAnswer);
        on('room-ice-candidate', handleRoomIceCandidate);
        on('room-error', handleRoomError);

        return () => {
            off('room-users');
            off('user-joined-room');
            off('user-left-room');
            off('room-offer');
            off('room-answer');
            off('room-ice-candidate');
            off('room-error');
        };
    }, [socket, on, off, emit, roomId, router, createPeerConnection]);

    const handleLeave = () => {
        emit('leave-room', { roomId });
        peersRef.current.forEach(peer => peer.pc.close());
        stopMedia();
        router.push('/groups');
    };

    const participantCount = peers.size + 1;
    const gridCols = participantCount <= 1 ? 1 : participantCount <= 2 ? 2 : participantCount <= 4 ? 2 : 3;

    if (mediaError) {
        return (
            <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3">Camera Access Required</h2>
                    <p className="text-white/50 mb-6">{mediaError}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#6C5CE7] rounded-full text-white font-medium hover:bg-[#5B4BD5] transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0a14] flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-transparent to-transparent" />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/groups"
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-white font-semibold text-lg">{roomName || 'Joining...'}</h1>
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span>{participantCount} in room</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLeave}
                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-sm font-medium transition-colors"
                >
                    Leave
                </button>
            </header>

            {/* Video Grid */}
            <div className="flex-1 relative z-10 p-4 md:p-6 flex items-center justify-center">
                {isJoining ? (
                    <div className="text-center">
                        <div className="w-16 h-16 border-2 border-white/10 border-t-[#6C5CE7] rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-white/50 text-lg">Joining room...</p>
                    </div>
                ) : (
                    <div
                        className="w-full h-full max-w-6xl grid gap-4"
                        style={{
                            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                            gridAutoRows: 'minmax(200px, 1fr)',
                        }}
                    >
                        {/* Local Video */}
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14] border border-white/10 min-h-[200px]">
                            <VideoPlayer stream={localStream} muted isLocal label="" />

                            {/* Name badge */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white">Y</span>
                                </div>
                                <span className="text-white text-sm font-medium">You</span>
                            </div>

                            {/* Muted indicator */}
                            {!isAudioEnabled && (
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Remote Videos */}
                        {Array.from(peers.values()).map((peer, index) => (
                            <div
                                key={peer.peerId}
                                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14] border border-white/10 min-h-[200px]"
                            >
                                {peer.stream ? (
                                    <VideoPlayer stream={peer.stream} label="" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">{index + 1}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">{index + 1}</span>
                                    </div>
                                    <span className="text-white text-sm font-medium">User {index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="relative z-10 flex items-center justify-center gap-3 p-6">
                <button
                    onClick={toggleAudio}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioEnabled
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}
                >
                    {isAudioEnabled ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    )}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoEnabled
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}
                >
                    {isVideoEnabled ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                    )}
                </button>

                <button
                    onClick={handleLeave}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                    </svg>
                </button>
            </div>
        </main>
    );
}
