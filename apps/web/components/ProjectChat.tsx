'use client';

import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface Message {
    id: string;
    message: string;
    userId: string;
    fullName: string;
    timestamp: string;
}

interface ProjectChatProps {
    projectId: string;
    user: any;
    socket: Socket | null;
}

export default function ProjectChat({ projectId, user, socket }: ProjectChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('new-message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('user-typing', (data: { fullName: string }) => {
            setIsTyping(data.fullName);
            setTimeout(() => setIsTyping(null), 3000);
        });

        return () => {
            socket.off('new-message');
            socket.off('user-typing');
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send-message', {
            projectId,
            message: newMessage,
            userId: user.id,
            fullName: user.fullName,
        });

        setNewMessage('');
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit('typing', { projectId, fullName: user.fullName });
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition group z-50"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl bg-opacity-95">
            {/* Header */}
            <div className="p-4 bg-white/10 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                    Project Chat
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        <p>No messages yet.</p>
                        <p>Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.userId === user.id ? 'items-end' : 'items-start'}`}
                    >
                        <span className="text-[10px] text-slate-400 mb-1 px-1">
                            {msg.userId === user.id ? 'You' : msg.fullName}
                        </span>
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.userId === user.id
                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                    : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/10'
                                }`}
                        >
                            {msg.message}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="text-[10px] text-purple-400 animate-pulse">
                        {isTyping} is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        className="absolute right-1 top-1 p-1 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
