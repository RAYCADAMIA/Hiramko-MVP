 import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2, Minimize2, Send, Paperclip, Phone, Video, Search, MoreVertical } from 'lucide-react';
import { User } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { MOCK_CONVERSATIONS, MOCK_USERS } from '../constants';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
}

interface Conversation {
    id: string;
    participants: User[];
    messages: Message[];
    lastMessage: Message;
}

interface ChatBoxProps {
    currentUser: User;
    isOpen: boolean;
    onClose: () => void;
    initialConversation?: Conversation;
}

const ChatBox: React.FC<ChatBoxProps> = ({ currentUser, isOpen, onClose, initialConversation }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeConversationId, setActiveConversationId] = useState<string>(MOCK_CONVERSATIONS[0].id);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync initial conversation if provided
    useEffect(() => {
        if (initialConversation) {
            // Check if it exists in current list, if not add it (mock logic)
            const exists = conversations.find(c => c.id === initialConversation.id);
            if (!exists) {
                setConversations(prev => [initialConversation, ...prev]);
            }
            setActiveConversationId(initialConversation.id);
        }
    }, [initialConversation]);

    const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages, isOpen, isMinimized, activeConversationId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !activeConversation) return;

        const text = messageText;
        setMessageText('');

        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            text: text,
            timestamp: 'Just now',
            isRead: false
        };

        // Update local state
        setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: newMessage
                };
            }
            return c;
        }));

        // Simulate AI response
        setIsTyping(true);

        // Find the other participant
        const otherUser = activeConversation.participants.find(p => p.id !== currentUser.id && p.id !== 'u3') || MOCK_USERS[0]; // Fallback logic

        const history = activeConversation.messages.map(m => ({
            sender: m.senderId === otherUser.id ? 'store' : 'user',
            text: m.text
        }));

        try {
            const response = await generateChatResponse(otherUser.name, text, history);

            setIsTyping(false);
            const aiMessage: Message = {
                id: `ai_${Date.now()}`,
                senderId: otherUser.id,
                text: response,
                timestamp: 'Just now',
                isRead: false
            };

            setConversations(prev => prev.map(c => {
                if (c.id === activeConversationId) {
                    return {
                        ...c,
                        messages: [...c.messages, aiMessage],
                        lastMessage: aiMessage
                    };
                }
                return c;
            }));

        } catch (error) {
            console.error("Error generating response:", error);
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    if (isMinimized) {
        return (
            <div
                className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-t-xl shadow-2xl z-50 w-72 cursor-pointer hover:bg-slate-800 transition"
                onClick={() => setIsMinimized(false)}
            >
                <div className="p-3 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="font-bold text-white text-sm">Messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMaximized(true); setIsMinimized(false); }}
                            className="text-slate-400 hover:text-white"
                        >
                            <Maximize2 className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="text-slate-400 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const otherParticipant = activeConversation?.participants.find(p => p.id !== currentUser.id && p.id !== 'u3') || MOCK_USERS[0];

    return (
        <div className={`fixed z-50 bg-slate-950 border border-slate-800 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${isMaximized
            ? 'top-0 left-0 w-full h-full rounded-none'
            : 'bottom-4 right-4 w-[800px] h-[600px] rounded-2xl'
            }`}>

            {/* Window Controls Header */}
            <div className="h-10 bg-slate-900 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
                <span className="text-xs font-bold text-slate-400">Messages</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                    <button onClick={() => setIsMaximized(!isMaximized)} className="text-slate-400 hover:text-white">
                        {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                    </button>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={`${isMaximized ? 'w-80' : 'w-64'} border-r border-slate-800 bg-slate-950 flex flex-col`}>
                    <div className="p-3 border-b border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map(conv => {
                            const other = conv.participants.find(p => p.id !== 'u3') || MOCK_USERS[0];
                            const isActive = conv.id === activeConversationId;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`p-3 flex items-center gap-3 cursor-pointer transition border-l-2 ${isActive ? 'bg-slate-900 border-l-cyan-500' : 'border-l-transparent hover:bg-slate-900/50'}`}
                                >
                                    <div className="relative">
                                        <img src={other.avatar} alt={other.name} className="w-8 h-8 rounded-full object-cover" />
                                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-slate-950"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="font-bold text-xs text-white truncate">{other.name}</h3>
                                            <span className="text-[10px] text-slate-500">{conv.lastMessage.timestamp}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 truncate">
                                            {conv.lastMessage.senderId === currentUser.id ? 'You: ' : ''}{conv.lastMessage.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-950 relative">
                    {/* Chat Header */}
                    <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <img src={otherParticipant.avatar} alt={otherParticipant.name} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                                <h3 className="font-bold text-white text-sm">{otherParticipant.name}</h3>
                                <p className="text-[10px] text-green-400 flex items-center gap-1">● Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <button className="hover:text-white transition"><Phone className="w-4 h-4" /></button>
                            <button className="hover:text-white transition"><Video className="w-4 h-4" /></button>
                            <button className="hover:text-white transition"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                        {activeConversation ? (
                            <>
                                {activeConversation.messages.map((msg) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    // Mock logic: if sender is 'u3' (Badsiro) and current user is guest, treat as 'Me'
                                    const displayAsMe = isMe || (msg.senderId === 'u3' && currentUser.id === 'guest_1');

                                    return (
                                        <div key={msg.id} className={`flex ${displayAsMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm relative ${displayAsMe
                                                ? 'bg-cyan-600 text-white rounded-tr-none'
                                                : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                                }`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-[10px] mt-1 text-right ${displayAsMe ? 'text-cyan-200' : 'text-slate-500'}`}>
                                                    {msg.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                Select a conversation to start chatting
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <button type="button" className="p-2 text-slate-400 hover:text-cyan-400 transition">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                            />
                            <button
                                type="submit"
                                disabled={!messageText.trim()}
                                className="p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
