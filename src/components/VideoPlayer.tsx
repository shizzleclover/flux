import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
    stream: MediaStream | null;
    muted?: boolean;
    isLocal?: boolean;
    label?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted = false, isLocal = false, label }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            console.log('📹 Attaching stream to video element', {
                isLocal,
                tracks: stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled }))
            });
            videoRef.current.srcObject = stream;
        } else if (videoRef.current) {
            console.log('📹 Clearing stream from video element', { isLocal });
            videoRef.current.srcObject = null;
        }
    }, [stream, isLocal]);

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={muted}
                    className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-white/30 gap-2">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium">No Signal</span>
                </div>
            )}

            {/* Label Badge */}
            {label && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-medium z-10">
                    {label} {muted && isLocal && '(You)'}
                </div>
            )}

            {/* Mute Indicator */}
            {muted && !isLocal && (
                <div className="absolute top-4 right-4 p-2 rounded-full bg-red-500/80 backdrop-blur text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeDasharray="36" strokeDashoffset="0" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                </div>
            )}
        </div>
    );
};
