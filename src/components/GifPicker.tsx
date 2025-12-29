'use client';

import React, { useState, useCallback } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import type { IGif } from '@giphy/js-types';

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'X8rzjP7StAq3amOZwgq4Ynjr0JYLxlON';
const gf = new GiphyFetch(GIPHY_API_KEY);

interface GifPickerProps {
    onSelect: (gifUrl: string) => void;
    onClose: () => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const fetchGifs = useCallback(
        (offset: number) => {
            if (searchTerm.trim()) {
                return gf.search(searchTerm, { offset, limit: 10 });
            }
            return gf.trending({ offset, limit: 10 });
        },
        [searchTerm]
    );

    const handleGifClick = (gif: IGif, e: React.SyntheticEvent<HTMLElement>) => {
        e.preventDefault();
        const gifUrl = gif.images.fixed_height.url;
        onSelect(gifUrl);
    };

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>GIFs</span>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Search */}
            <div style={{ padding: '12px 16px' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search GIFs..."
                    style={{
                        width: '100%',
                        height: '36px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '18px',
                        padding: '0 16px',
                        fontSize: '13px',
                        color: 'white',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            {/* GIF Grid */}
            <div
                style={{
                    height: '200px',
                    overflowY: 'auto',
                    padding: '0 8px 8px',
                }}
            >
                <Grid
                    key={searchTerm}
                    width={320}
                    columns={2}
                    fetchGifs={fetchGifs}
                    onGifClick={handleGifClick}
                    noLink
                    hideAttribution
                />
            </div>

            {/* Powered by GIPHY */}
            <div
                style={{
                    padding: '8px',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    Powered by GIPHY
                </span>
            </div>
        </div>
    );
};

export default GifPicker;
