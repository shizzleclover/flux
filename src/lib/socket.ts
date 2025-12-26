import { io, Socket } from 'socket.io-client';

// Use environment variable or fallback to production Railway URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://flux-be-production.up.railway.app';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: false,
        });
    }
    return socket;
};

export const connectSocket = (): Socket => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = (): void => {
    if (socket?.connected) {
        socket.disconnect();
    }
};
