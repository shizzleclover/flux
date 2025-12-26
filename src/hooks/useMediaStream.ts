'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseMediaStreamReturn {
    localStream: MediaStream | null;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    error: string | null;
    startMedia: () => Promise<MediaStream | null>;
    stopMedia: () => void;
    toggleVideo: () => void;
    toggleAudio: () => void;
}

export function useMediaStream(): UseMediaStreamReturn {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startMedia = useCallback(async (): Promise<MediaStream | null> => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            streamRef.current = stream;
            setLocalStream(stream);
            setIsVideoEnabled(true);
            setIsAudioEnabled(true);
            console.log('📹 Media stream started');
            return stream;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to access camera/microphone';
            setError(message);
            console.error('📹 Media error:', err);
            return null;
        }
    }, []);

    const stopMedia = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            setLocalStream(null);
            console.log('📹 Media stream stopped');
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, []);

    const toggleAudio = useCallback(() => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopMedia();
        };
    }, [stopMedia]);

    return {
        localStream,
        isVideoEnabled,
        isAudioEnabled,
        error,
        startMedia,
        stopMedia,
        toggleVideo,
        toggleAudio,
    };
}
