'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RoomInfo {
    roomId: string;
    name: string;
    participantCount: number;
    maxParticipants: number;
}

export default function GroupsPage() {
    const router = useRouter();
    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flux-be-production.up.railway.app';

    const fetchRooms = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/rooms`);
            const data = await res.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateRoom = async () => {
        if (creating) return;
        setCreating(true);

        try {
            const res = await fetch(`${apiUrl}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roomName || undefined }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/groups/${data.data.roomId}`);
            }
        } catch (error) {
            console.error('Failed to create room:', error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Back Button - Outside Container */}
            <div className="px-6 py-4">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Back</span>
                </Link>
            </div>

            {/* Page Container */}
            <div className="max-w-xl mx-auto px-6 pt-4">
                {/* Header Row: Title left, Create button right */}
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-bold text-white">Group Rooms</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Room
                    </button>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-1.5 bg-[#10b98126] text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full mb-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} active
                </div>

                {/* Subtitle */}
                <p className="text-gray-400 text-sm mb-4">Join a room or create your own</p>

                {/* Room List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-gray-700 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                ) : rooms.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-800/50 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-1">No rooms yet</h2>
                        <p className="text-gray-400 text-sm mb-5">Create one to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Create Room
                        </button>
                    </div>
                ) : (
                    /* Room Cards */
                    <div className="space-y-3">
                        {rooms.map((room) => (
                            <div
                                key={room.roomId}
                                className="bg-[#1f293799] border border-[#37415180] rounded-xl p-4 hover:bg-gray-800 hover:border-gray-600 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon container - INSIDE the card */}
                                    <div className="bg-[#a855f733] p-2.5 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>

                                    {/* Room info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-medium truncate">
                                            {room.name.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                                        </h3>
                                        <p className="text-gray-400 text-sm">{room.participantCount}/{room.maxParticipants} participants</p>
                                    </div>

                                    {/* Join button - MUST have background */}
                                    <Link
                                        href={`/groups/${room.roomId}`}
                                        className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Join
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-sm bg-[#1a1a24] rounded-xl p-6 border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold text-white mb-1">Create Room</h2>
                        <p className="text-gray-400 text-sm mb-5">Name your room or leave blank</p>

                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Room name"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors mb-4"
                            maxLength={50}
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                disabled={creating}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
