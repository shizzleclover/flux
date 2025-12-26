import React from 'react';

type ConnectionStatusType = 'idle' | 'searching' | 'connecting' | 'connected' | 'disconnected';

interface ConnectionStatusProps {
    status: ConnectionStatusType;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'searching':
                return {
                    label: 'Searching for peer...',
                    color: 'bg-yellow-400',
                    pulse: true,
                    icon: (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    )
                };
            case 'connecting':
                return {
                    label: 'Connecting...',
                    color: 'bg-blue-500',
                    pulse: true,
                    icon: <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                };
            case 'connected':
                return {
                    label: 'Connected',
                    color: 'bg-green-500',
                    pulse: false,
                    icon: <span className="w-2 h-2 rounded-full bg-white" />
                };
            case 'disconnected':
                return {
                    label: 'Disconnected',
                    color: 'bg-red-500',
                    pulse: false,
                    icon: (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )
                };
            case 'idle':
            default:
                return {
                    label: 'Ready',
                    color: 'bg-white/20',
                    pulse: false,
                    icon: <span className="w-2 h-2 rounded-full bg-white/50" />
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-lg">
            <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${config.color} ${config.pulse ? 'custom-pulse' : ''} bg-opacity-20`}>
                <div className={`w-2.5 h-2.5 rounded-full ${config.color.replace('bg-', 'text-')} flex items-center justify-center`}>
                    {/* Inner dot */}
                </div>

                {/* Animated ring */}
                {config.pulse && (
                    <div className={`absolute inset-0 rounded-full ${config.color} animate-ping opacity-20`} />
                )}
            </div>

            <span className="text-sm font-medium text-white/90">
                {config.label}
            </span>
        </div>
    );
};
