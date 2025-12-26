import React, { useState, useEffect, useRef } from 'react';

interface Message {
    id: string;
    text: string;
    isOwn: boolean;
    timestamp: number;
}

interface TextChatProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    onTyping: (isTyping: boolean) => void;
    isPeerTyping: boolean;
    disabled?: boolean;
}

export const TextChat: React.FC<TextChatProps> = ({
    messages,
    onSendMessage,
    onTyping,
    isPeerTyping,
    disabled = false,
}) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPeerTyping]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        onTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || disabled) return;
        onSendMessage(inputText.trim());
        setInputText('');
        onTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {messages.length === 0 && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '0 24px'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <svg style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
                            It's quiet here...
                        </p>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                            Say hello to start the conversation!
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: msg.isOwn ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.isOwn ? 'flex-end' : 'flex-start',
                            maxWidth: '280px',
                            gap: '6px'
                        }}>
                            {/* Message Bubble */}
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: msg.isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                backgroundColor: msg.isOwn ? '#ffffff' : 'rgba(255,255,255,0.1)',
                                color: msg.isOwn ? '#1a1a2e' : '#ffffff',
                                border: msg.isOwn ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                wordBreak: 'break-word'
                            }}>
                                {msg.text}
                            </div>
                            {/* Timestamp */}
                            <span style={{
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.4)',
                                paddingLeft: '4px',
                                paddingRight: '4px'
                            }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isPeerTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '16px 16px 16px 4px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'bounce 1s infinite 0.15s' }} />
                            <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'bounce 1s infinite 0.3s' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '16px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        position: 'relative',
                        opacity: disabled ? 0.5 : 1
                    }}
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        disabled={disabled}
                        placeholder={disabled ? "Connecting..." : "Type a message..."}
                        style={{
                            width: '100%',
                            height: '48px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '24px',
                            padding: '0 56px 0 20px',
                            fontSize: '14px',
                            color: 'white',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || disabled}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            backgroundColor: (!inputText.trim() || disabled) ? 'rgba(255,255,255,0.1)' : 'white',
                            color: (!inputText.trim() || disabled) ? 'rgba(255,255,255,0.3)' : 'black',
                            border: 'none',
                            cursor: (!inputText.trim() || disabled) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};
