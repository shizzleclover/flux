'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VideoPlayer, ControlBar, TextChat, ConnectionStatus } from '@/components';
import Dock from '@/components/Dock';
import { useSocket, useMediaStream, useWebRTC } from '@/hooks';

type ChatStatus = 'idle' | 'searching' | 'connecting' | 'connected' | 'disconnected';

interface Message {
    id: string;
    text: string;
    isOwn: boolean;
    timestamp: number;
}

export default function ChatPage() {
    const router = useRouter();
    const { socket, isConnected, emit, on, off } = useSocket();
    const { localStream, isVideoEnabled, isAudioEnabled, error: mediaError, startMedia, stopMedia, toggleVideo, toggleAudio } = useMediaStream();
    const { remoteStream, connectionState, peerId, createOffer, handleOffer, handleAnswer, handleIceCandidate, closeConnection, setPeerId } = useWebRTC();

    const [status, setStatus] = useState<ChatStatus>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPeerTyping, setIsPeerTyping] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStartTime, setCallStartTime] = useState<number | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);

    // Keep localStreamRef in sync
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // Call duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'connected' && callStartTime) {
            interval = setInterval(() => {
                setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, callStartTime]);

    // Format duration as MM:SS
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize media and join queue on mount
    useEffect(() => {
        const init = async () => {
            const stream = await startMedia();
            if (stream) {
                setStatus('searching');
                emit('join-queue');
            }
        };

        if (isConnected) {
            init();
        }
    }, [isConnected, startMedia, emit]);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        const handleMatched = async ({ peerId: matchedPeerId, initiator }: { peerId: string; initiator: boolean }) => {
            console.log('🎯 Matched with:', matchedPeerId, 'Initiator:', initiator);
            setPeerId(matchedPeerId);
            setStatus('connecting');
            setMessages([]);
            setIsPeerTyping(false);
            setCallStartTime(Date.now());
            setCallDuration(0);

            if (initiator && localStreamRef.current) {
                setTimeout(() => {
                    if (localStreamRef.current) {
                        createOffer(localStreamRef.current, matchedPeerId);
                    }
                }, 500);
            }
        };

        const handleWaiting = () => {
            console.log('⏳ Waiting for peer...');
            setStatus('searching');
        };

        const handleOfferReceived = async ({ sdp, senderId }: { sdp: RTCSessionDescriptionInit; senderId: string }) => {
            console.log('📥 Offer received from:', senderId);
            setPeerId(senderId);
            if (localStreamRef.current) {
                await handleOffer(sdp, localStreamRef.current);
            }
        };

        const handleAnswerReceived = async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
            console.log('📥 Answer received');
            await handleAnswer(sdp);
        };

        const handleIceCandidateReceived = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            console.log('📥 ICE candidate received');
            handleIceCandidate(candidate);
        };

        const handleChatMessage = ({ message, senderId, timestamp }: { message: string; senderId: string; timestamp: number }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `${senderId}-${timestamp}`,
                    text: message,
                    isOwn: false,
                    timestamp,
                },
            ]);
        };

        const handlePeerTyping = ({ isTyping }: { isTyping: boolean }) => {
            setIsPeerTyping(isTyping);
        };

        const handlePeerDisconnected = () => {
            console.log('👋 Peer disconnected');
            closeConnection();
            setStatus('searching');
            setMessages([]);
            setIsPeerTyping(false);
            setCallStartTime(null);
            setCallDuration(0);
            emit('join-queue');
        };

        on('matched', handleMatched);
        on('waiting', handleWaiting);
        on('offer', handleOfferReceived);
        on('answer', handleAnswerReceived);
        on('ice-candidate', handleIceCandidateReceived);
        on('chat-message', handleChatMessage);
        on('peer-typing', handlePeerTyping);
        on('peer-disconnected', handlePeerDisconnected);

        return () => {
            off('matched');
            off('waiting');
            off('offer');
            off('answer');
            off('ice-candidate');
            off('chat-message');
            off('peer-typing');
            off('peer-disconnected');
        };
    }, [socket, on, off, emit, setPeerId, createOffer, handleOffer, handleAnswer, handleIceCandidate, closeConnection]);

    // Update status when connection state changes
    useEffect(() => {
        if (connectionState === 'connected') {
            setStatus('connected');
        } else if (connectionState === 'disconnected' || connectionState === 'failed') {
            setStatus('disconnected');
        }
    }, [connectionState]);

    // Handle "Next" button (Switch User)
    const handleNext = useCallback(() => {
        closeConnection();
        setMessages([]);
        setIsPeerTyping(false);
        setStatus('searching');
        setCallStartTime(null);
        setCallDuration(0);
        emit('next');
    }, [closeConnection, emit]);

    // Handle "End" button
    const handleEnd = useCallback(() => {
        closeConnection();
        stopMedia();
        emit('leave-queue');
        router.push('/');
    }, [closeConnection, stopMedia, emit, router]);

    // Send chat message
    const handleSendMessage = useCallback((text: string) => {
        if (!peerId) return;

        const message: Message = {
            id: `self-${Date.now()}`,
            text,
            isOwn: true,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);
        emit('chat-message', { message: text, targetId: peerId });
    }, [emit, peerId]);

    // Handle typing indicator
    const handleTyping = useCallback((isTyping: boolean) => {
        emit('typing', { isTyping });
    }, [emit]);

    // Show error if media access fails
    if (mediaError) {
        return (
            <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3">Camera Access Required</h2>
                    <p className="text-white/60 mb-6">{mediaError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#6C5CE7] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#5B4BD5] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#1a1a2e] flex flex-col relative overflow-hidden">
            {/* Header - Just connection status */}
            <header className="absolute top-0 left-0 right-0 z-20 p-3 md:p-4 flex items-center justify-end">
                <ConnectionStatus status={status} />
            </header>

            {/* Mobile: Full-screen remote video with PIP local video */}
            {/* Desktop: Side-by-side videos */}
            <div className="flex-1 relative md:flex md:flex-row md:p-4 md:pt-20 md:pb-24 md:gap-4">
                {/* Remote Video - Full screen on mobile, half on desktop */}
                <div className="absolute inset-0 md:relative md:flex-1 md:rounded-2xl overflow-hidden bg-gradient-to-br from-[#2a2a4a] to-[#1a1a2e] md:border md:border-[#6C5CE7]/50">
                    <VideoPlayer stream={remoteStream} label="" />
                    {/* Name Badge - Hidden on mobile, shown on desktop */}
                    <div className="hidden md:flex absolute bottom-4 left-4 items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            S
                        </div>
                        <span className="text-white font-medium text-sm">
                            {status === 'connected' ? 'Stranger' : status === 'searching' ? 'Searching...' : 'Connecting...'}
                        </span>
                    </div>
                    {/* Status overlay for mobile when no stream */}
                    {!remoteStream && (
                        <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-white/50 text-sm">
                                {status === 'searching' ? 'Looking for a stranger...' : 'No Signal'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Local Video - PIP on mobile, side-by-side on desktop */}
                <div className="absolute top-16 right-3 w-28 h-40 md:relative md:top-auto md:right-auto md:w-auto md:h-auto md:flex-1 rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-[#2a2a4a] to-[#1a1a2e] border-2 border-white/20 md:border md:border-white/10 shadow-xl z-10">
                    <VideoPlayer stream={localStream} muted isLocal label="" />
                    {/* Name Badge - Only on desktop */}
                    <div className="hidden md:flex absolute bottom-4 left-4 items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                            Y
                        </div>
                        <span className="text-white font-medium text-sm">You</span>
                    </div>
                </div>
            </div>

            {/* Animated Dock Control Bar */}
            <Dock
                leftElement={
                    <div className="flex items-center gap-2 mr-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white font-medium text-sm">{formatDuration(callDuration)}</span>
                    </div>
                }
                items={[
                    {
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ),
                        label: 'End Call',
                        onClick: handleEnd,
                        className: 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border-red-500/50'
                    },
                    {
                        icon: isAudioEnabled ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ),
                        label: isAudioEnabled ? 'Mute' : 'Unmute',
                        onClick: toggleAudio,
                        active: !isAudioEnabled,
                        disabled: !localStream
                    },
                    {
                        icon: isVideoEnabled ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                            </svg>
                        ),
                        label: isVideoEnabled ? 'Hide Video' : 'Show Video',
                        onClick: toggleVideo,
                        active: !isVideoEnabled,
                        disabled: !localStream
                    },
                    {
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        ),
                        label: 'Chat',
                        onClick: () => setShowChat(!showChat),
                        active: showChat
                    },
                    {
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        ),
                        label: 'Next Person',
                        onClick: handleNext,
                        disabled: status === 'searching',
                        className: 'bg-[#6C5CE7] border-[#6C5CE7]'
                    }
                ]}
                panelHeight={68}
                baseItemSize={44}
                magnification={58}
                distance={120}
            />

            {/* Chat Sidebar - Full screen on mobile */}
            <div
                className={`
                    fixed inset-0 md:inset-auto md:top-0 md:right-0 md:h-full md:w-96 z-30
                    transition-transform duration-300 ease-in-out transform 
                    ${showChat ? 'translate-x-0' : 'translate-x-full'}
                    bg-[#1a1a2e] md:bg-[#1a1a2e]/95 md:backdrop-blur-xl md:border-l md:border-white/10
                `}
            >
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4">
                    <h3 className="text-white font-semibold">Chat</h3>
                    <button
                        onClick={() => setShowChat(false)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="h-[calc(100%-60px)]">
                    <TextChat
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onTyping={handleTyping}
                        isPeerTyping={isPeerTyping}
                        disabled={status !== 'connected'}
                    />
                </div>
            </div>
        </main>
    );
}
