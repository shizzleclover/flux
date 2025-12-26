import React from 'react';

interface ControlBarProps {
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
    onNext: () => void;
    onEnd: () => void;
    disabled?: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
    isVideoEnabled,
    isAudioEnabled,
    onToggleVideo,
    onToggleAudio,
    onNext,
    onEnd,
    disabled = false,
}) => {
    return (
        <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
                onClick={onToggleAudio}
                disabled={disabled}
                className={`p-4 rounded-full transition-all duration-300 ${isAudioEnabled
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
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

            {/* Video Toggle */}
            <button
                onClick={onToggleVideo}
                disabled={disabled}
                className={`p-4 rounded-full transition-all duration-300 ${isVideoEnabled
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
            >
                {isVideoEnabled ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20l14-14" />
                    </svg>
                )}
            </button>

            {/* End Call */}
            <button
                onClick={onEnd}
                disabled={disabled}
                className={`group p-4 rounded-full bg-red-500/10 hover:bg-red-500 border border-red-500/50 text-red-500 hover:text-white transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                title="End Call"
            >
                <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Next Match */}
            <button
                onClick={onNext}
                disabled={disabled}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg ${disabled
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : 'bg-white text-black hover:scale-105 active:scale-95 hover:shadow-white/20'
                    }`}
            >
                Next Match
            </button>
        </div>
    );
};
