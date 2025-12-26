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

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPeerTyping]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        // Handle typing indicator
        onTyping(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || disabled) return;

        onSendMessage(inputText.trim());
        setInputText('');
        onTyping(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 rotate-12">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-white">No messages yet</p>
                        <p className="text-xs text-white/70">Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.isOwn
                                    ? 'bg-white text-black rounded-tr-sm'
                                    : 'bg-white/10 text-white backdrop-blur-md border border-white/10 rounded-tl-sm'
                                }`}
                        >
                            <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                            <span className={`text-[10px] block mt-1 opacity-50 ${msg.isOwn ? 'text-black' : 'text-white'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isPeerTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 w-16">
                            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <div className="relative">
                    <input
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        disabled={disabled}
                        placeholder={disabled ? "Connecting..." : "Type a message..."}
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-white/30 rounded-full pl-5 pr-12 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || disabled}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white text-black disabled:bg-white/10 disabled:text-white/20 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                        <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};
