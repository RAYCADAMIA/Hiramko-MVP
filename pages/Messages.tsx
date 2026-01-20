import React, { useState, useEffect } from 'react';
import { MOCK_CONVERSATIONS, MOCK_USERS } from '../constants';
import { Send, MoreVertical, Phone, Video, Search, Paperclip } from 'lucide-react';
import { User, UserType } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface MessagesProps {
    user: User | null;
}

const Messages: React.FC<MessagesProps> = ({ user }) => {
    // Fallback guest user for unauthenticated access
    const guestUser: User = {
        id: 'guest_1',
        name: 'Guest Visitor',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=1e293b&color=94a3b8',
        type: UserType.BASIC,
        rating: 0,
        verified: false,
        joinedDate: '2023-01-01',
        reviews: 0,
        location: 'Manila'
    };

    const currentUser = user || guestUser;

    const [activeConversationId, setActiveConversationId] = useState(MOCK_CONVERSATIONS[0].id);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
    const [isTyping, setIsTyping] = useState(false);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Identify the other participant
    const otherParticipant = activeConversation?.participants.find(p => p.id !== currentUser.id && p.id !== 'u3') || MOCK_USERS[0];

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const msgText = newMessage;
        setNewMessage('');

        // 1. Add User Message
        const userMsg = {
            id: `new_${Date.now()}`,
            senderId: currentUser.id,
            text: msgText,
            timestamp: 'Just now',
            isRead: false
        };

        const updatedConversations = conversations.map(c => {
            if (c.id === activeConversationId) {
                return {
                    ...c,
                    messages: [...c.messages, userMsg],
                    lastMessage: userMsg
                };
            }
            return c;
        });

        setConversations(updatedConversations);

        // 2. AI Response Simulation
        setIsTyping(true);

        const history = activeConversation.messages.map(m => ({
            sender: m.senderId === otherParticipant.id ? 'store' : 'user',
            text: m.text
        }));

        const aiReplyText = await generateChatResponse(otherParticipant.name, msgText, history);

        setIsTyping(false);

        const aiMsg = {
            id: `ai_${Date.now()}`,
            senderId: otherParticipant.id,
            text: aiReplyText,
            timestamp: 'Just now',
            isRead: false
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return {
                    ...c,
                    messages: [...c.messages, aiMsg],
                    lastMessage: aiMsg
                };
            }
            return c;
        }));
    };

    return (
        <div className="pt-16 h-screen bg-slate-950 flex overflow-hidden">

            {/* Sidebar */}
            <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col h-full">
                <div className="p-4">
                    <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conversation => {
                        const other = conversation.participants.find(p => p.id !== 'u3') || MOCK_USERS[0];
                        const isActive = conversation.id === activeConversationId;

                        return (
                            <div
                                key={conversation.id}
                                onClick={() => setActiveConversationId(conversation.id)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition border-l-2 ${isActive ? 'bg-slate-900 border-l-cyan-500' : 'border-l-transparent hover:bg-slate-900/50'}`}
                            >
                                <div className="relative">
                                    <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-950"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className="font-bold text-sm text-white truncate">{other.name}</h3>
                                        <span className="text-[10px] text-slate-500">{conversation.lastMessage.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">
                                        {conversation.lastMessage.senderId === currentUser.id ? 'You: ' : ''}{conversation.lastMessage.text}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-950 h-full relative">
                {/* Chat Header */}
                <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div className="flex items-center gap-3">
                        <img src={otherParticipant.avatar} alt={otherParticipant.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <h2 className="font-bold text-white text-lg">
                                {otherParticipant.name}
                            </h2>
                            <p className="text-xs text-green-500 flex items-center gap-1">● Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-slate-400">
                        <button className="hover:text-white transition"><Phone className="w-5 h-5" /></button>
                        <button className="hover:text-white transition"><Video className="w-5 h-5" /></button>
                        <button className="hover:text-white transition"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
                    {activeConversation?.messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUser.id;
                        // Mock logic: if sender is 'u3' (Badsiro in mock data) and current user is guest, treat as 'Me' for demo
                        const displayAsMe = isMe || (msg.senderId === 'u3' && currentUser.id === 'guest_1');

                        return (
                            <div key={idx} className={`flex ${displayAsMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[60%] rounded-2xl px-5 py-3 relative ${displayAsMe
                                        ? 'bg-cyan-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${displayAsMe ? 'text-cyan-200' : 'text-slate-500'}`}>{msg.timestamp}</p>
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 focus-within:border-cyan-500 transition">
                        <button type="button" className="text-slate-500 hover:text-white transition">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none py-2"
                        />
                        <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Messages;