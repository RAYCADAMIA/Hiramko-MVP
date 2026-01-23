import React, { useState, useEffect } from 'react';
import { MOCK_CONVERSATIONS, MOCK_USERS } from '../constants';
import { Send, MoreVertical, Phone, Video, Search, Paperclip, Loader2, MessageCircle } from 'lucide-react';
import { User, UserType, Conversation, ChatMessage } from '../types';
import { api } from '../services/api';
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

    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConvs = async () => {
            if (user) {
                const data = await api.getConversations(user.id);
                setConversations(data);

                // Check for ?conv= in URL
                const query = new URLSearchParams(window.location.search);
                const convId = query.get('conv');

                if (convId) {
                    setActiveConversationId(convId);
                } else if (data.length > 0 && !activeConversationId) {
                    setActiveConversationId(data[0].id);
                }
            }
            setLoading(false);
        };
        fetchConvs();
    }, [user]);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Identify the other participant
    const otherParticipant = activeConversation?.participants.find(p => p.id !== currentUser.id && p.id !== 'u3') || MOCK_USERS[0];

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !currentUser.id) return;

        const msgText = newMessage;
        setNewMessage('');

        try {
            // 1. Persist to Supabase
            const { data: userMsg, error } = await api.sendChatMessage(activeConversation.id, currentUser.id, msgText);
            if (error) throw error;

            if (userMsg) {
                setConversations(prev => prev.map(c => {
                    if (c.id === activeConversation.id) {
                        return {
                            ...c,
                            messages: [...c.messages, userMsg],
                            lastMessage: userMsg
                        };
                    }
                    return c;
                }));
            }

            // 2. AI Response Simulation
            setIsTyping(true);

            const history = activeConversation.messages.map(m => ({
                sender: m.senderId === otherParticipant.id ? 'store' : 'user',
                text: m.text
            }));

            const aiReplyText = await generateChatResponse(otherParticipant.name, msgText, history);

            // Persist AI Message to Supabase
            const { data: aiMsg, error: aiError } = await api.sendChatMessage(activeConversation.id, otherParticipant.id, aiReplyText);

            setIsTyping(false);

            if (aiMsg) {
                setConversations(prev => prev.map(c => {
                    if (c.id === activeConversation.id) {
                        return {
                            ...c,
                            messages: [...c.messages, aiMsg],
                            lastMessage: aiMsg
                        };
                    }
                    return c;
                }));
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="pt-16 h-screen bg-slate-950 flex overflow-hidden">

            {/* Sidebar */}
            <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col h-full">
                <div className="p-4 border-b border-slate-800">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                            <p className="text-xs font-medium uppercase tracking-widest">Loading Chats...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 p-6 text-center text-slate-500 gap-4">
                            <div className="p-4 bg-slate-950 rounded-full border border-slate-800">
                                <MessageCircle className="w-8 h-8 opacity-20" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-1">No Messages Yet</p>
                                <p className="text-xs leading-relaxed">Browse items and start a conversation with owners!</p>
                            </div>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const other = conv.participants.find(p => p.id !== currentUser.id) || MOCK_USERS[0];
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`w-full p-4 flex gap-4 items-center transition-all hover:bg-slate-800/50 border-l-4 ${activeConversationId === conv.id ? 'bg-cyan-500/10 border-cyan-500 shadow-[inset_4px_0_12px_rgba(6,182,212,0.1)]' : 'border-transparent'}`}
                                >
                                    <div className="relative">
                                        <img src={other.avatar} alt={other.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-800" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-sm text-white truncate">{other.name}</h3>
                                            <span className="text-[10px] text-slate-500 font-medium">{conv.lastMessage.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate leading-relaxed">
                                            {conv.lastMessage.senderId === currentUser.id && <span className="text-cyan-500/70 mr-1">You:</span>}
                                            {conv.lastMessage.text}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-950/50 backdrop-blur-md relative">
                {!activeConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-cyan-500/20">
                            <MessageCircle className="w-10 h-10 text-cyan-400 opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your Conversations</h2>
                        <p className="max-w-xs mx-auto text-sm leading-relaxed">
                            Select a chat from the sidebar to start messaging. Your safety and transactions are our priority.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={otherParticipant.avatar} alt={otherParticipant.name} className="w-10 h-10 rounded-full border-2 border-slate-800" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{otherParticipant.name}</h3>
                                    <p className="text-[10px] text-cyan-400 font-mono tracking-tighter uppercase">Online • Trusted Owner</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><Phone size={18} /></button>
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><Video size={18} /></button>
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.03),transparent_40%)]">
                            {activeConversation.messages.map((msg, index) => {
                                const isMe = msg.senderId === currentUser.id;
                                const showAvatar = index === 0 || activeConversation.messages[index - 1].senderId !== msg.senderId;

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {!isMe && (
                                                <div className="w-8 flex-shrink-0">
                                                    {showAvatar && <img src={otherParticipant.avatar} className="w-8 h-8 rounded-full border border-slate-800 mt-1 shadow-md" alt="" />}
                                                </div>
                                            )}
                                            <div>
                                                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe
                                                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none border border-cyan-500/30'
                                                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                                <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">{msg.timestamp}</span>
                                                    {isMe && <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-tighter">Delivered</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {isTyping && (
                                <div className="flex justify-start animate-in fade-in duration-300">
                                    <div className="flex gap-3 items-center bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl rounded-tl-none">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{otherParticipant.name} is typing...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-slate-900/40 backdrop-blur-md border-t border-slate-800">
                            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                                <div className="flex-1 relative group">
                                    <div className="absolute left-3 bottom-3 flex gap-2">
                                        <button type="button" className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"><Paperclip size={18} /></button>
                                    </div>
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message ${otherParticipant.name}...`}
                                        rows={1}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner resize-none min-h-[48px]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-3.5 rounded-2xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all transform active:scale-95"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                            <p className="text-[9px] text-center text-slate-500 mt-3 font-medium uppercase tracking-[0.2em]">
                                Secure end-to-end encrypted channel
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Messages;