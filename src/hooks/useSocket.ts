'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    emit: (event: string, data?: unknown) => void;
    on: <T = unknown>(event: string, callback: (data: T) => void) => void;
    off: (event: string, callback?: (...args: unknown[]) => void) => void;
}

export function useSocket(): UseSocketReturn {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = connectSocket();
        socketRef.current = socket;

        const handleConnect = () => {
            setIsConnected(true);
            console.log('🔌 Socket connected:', socket.id);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            console.log('🔌 Socket disconnected');
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        // Set initial state
        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, []);

    const emit = useCallback((event: string, data?: unknown) => {
        socketRef.current?.emit(event, data);
    }, []);

    const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
        socketRef.current?.on(event, callback as (...args: unknown[]) => void);
    }, []);

    const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
        if (callback) {
            socketRef.current?.off(event, callback);
        } else {
            socketRef.current?.off(event);
        }
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off,
    };
}
