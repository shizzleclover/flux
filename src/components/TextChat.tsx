'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GifPicker } from './GifPicker';
import { Theme } from 'emoji-picker-react';

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface Message {
    id: string;
    text: string;
    isOwn: boolean;
    timestamp: number;
    type?: 'text' | 'gif';
    gifUrl?: string;
}

interface TextChatProps {
    messages: Message[];
    onSendMessage: (text: string, type?: 'text' | 'gif', gifUrl?: string) => void;
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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        onSendMessage(inputText.trim(), 'text');
        setInputText('');
        onTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const handleEmojiSelect = (emojiData: { emoji: string }) => {
        setInputText((prev) => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    const handleGifSelect = (gifUrl: string) => {
        onSendMessage(gifUrl, 'gif', gifUrl);
        setShowGifPicker(false);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        setShowGifPicker(false);
    };

    const toggleGifPicker = () => {
        setShowGifPicker(!showGifPicker);
        setShowEmojiPicker(false);
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
                            {/* Message Bubble or GIF */}
                            {msg.type === 'gif' && msg.gifUrl ? (
                                <div style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    maxWidth: '200px',
                                }}>
                                    <img
                                        src={msg.gifUrl}
                                        alt="GIF"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            ) : (
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
                            )}
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

            {/* Suggestion Chips - Collapsible */}
            {messages.length < 5 && !disabled && (
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                    {/* Toggle Button */}
                    <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        style={{
                            width: '100%',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >
                        <span>💡 Conversation starters</span>
                        <svg
                            style={{
                                width: '12px',
                                height: '12px',
                                transform: showSuggestions ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Chips Container - Animated */}
                    <div style={{
                        maxHeight: showSuggestions ? '200px' : '0px',
                        opacity: showSuggestions ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease-out, opacity 0.2s ease-out',
                    }}>
                        <div style={{
                            padding: '8px 16px 12px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}>
                            {[
                                { text: "What's your snap? 👻" },
                                { text: "Where are you from? 🌍" },
                                { text: "What's your vibe today? ✨" },
                                { text: "Music recommendations? 🎵" },
                                { text: "Hot take time 🔥" },
                                { text: "What are you up to? 💭" },
                            ].map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onSendMessage(suggestion.text, 'text');
                                        setShowSuggestions(false);
                                    }}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(108, 92, 231, 0.15)',
                                        border: '1px solid rgba(108, 92, 231, 0.3)',
                                        color: 'white',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.3)';
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.15)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {suggestion.text}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div style={{
                padding: '16px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
            }}>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '16px',
                            marginBottom: '8px',
                            zIndex: 10,
                        }}
                    >
                        <EmojiPicker
                            onEmojiClick={handleEmojiSelect}
                            width={320}
                            height={350}
                            theme={Theme.DARK}
                            searchPlaceholder="Search emoji..."
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}

                {/* GIF Picker */}
                {showGifPicker && (
                    <GifPicker
                        onSelect={handleGifSelect}
                        onClose={() => setShowGifPicker(false)}
                    />
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: disabled ? 0.5 : 1
                    }}
                >
                    {/* Emoji Button */}
                    <button
                        type="button"
                        onClick={toggleEmojiPicker}
                        disabled={disabled}
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            backgroundColor: showEmojiPicker ? 'rgba(108, 92, 231, 0.3)' : 'rgba(255,255,255,0.05)',
                            border: showEmojiPicker ? '1px solid #6C5CE7' : '1px solid rgba(255,255,255,0.1)',
                            color: showEmojiPicker ? '#6C5CE7' : 'rgba(255,255,255,0.6)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>😊</span>
                    </button>

                    {/* GIF Button */}
                    <button
                        type="button"
                        onClick={toggleGifPicker}
                        disabled={disabled}
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            backgroundColor: showGifPicker ? 'rgba(108, 92, 231, 0.3)' : 'rgba(255,255,255,0.05)',
                            border: showGifPicker ? '1px solid #6C5CE7' : '1px solid rgba(255,255,255,0.1)',
                            color: showGifPicker ? '#6C5CE7' : 'rgba(255,255,255,0.6)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            fontWeight: 700,
                            fontSize: '11px',
                        }}
                    >
                        GIF
                    </button>

                    {/* Input Field */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            ref={inputRef}
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
                    </div>
                </form>
            </div>
        </div>
    );
};
