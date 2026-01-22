import { supabase } from './supabase';
import { ChatMessage, Conversation, User, UserType } from '../types';

export const getConversations = async (userId: string): Promise<Conversation[]> => {
    // Fetch conversations where user is a participant
    const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [userId]);

    if (convError) {
        console.error('Error fetching conversations:', convError);
        return [];
    }

    const conversations: Conversation[] = [];

    for (const conv of convs) {
        // Fetch participants details
        const { data: participants, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', conv.participant_ids);

        if (pError) continue;

        // Fetch messages for this conversation
        const { data: msgs, error: mError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

        if (mError) continue;

        const mappedMessages: ChatMessage[] = msgs.map(m => ({
            id: m.id,
            senderId: m.sender_id,
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: m.is_read
        }));

        conversations.push({
            id: conv.id,
            participants: participants.map(p => ({
                id: p.id,
                name: p.full_name || 'User',
                email: p.email || '',
                avatar: p.avatar_url || 'https://via.placeholder.com/150',
                type: (p.user_type as UserType) || UserType.REGULAR,
                rating: p.rating || 0,
                reviews: p.reviews_count || 0,
                location: p.location || '',
                joinedDate: p.joined_date,
                verified: p.is_verified
            })),
            lastMessage: mappedMessages[mappedMessages.length - 1] || {
                id: 'empty',
                senderId: '',
                text: 'No messages yet',
                timestamp: '',
                isRead: true
            },
            messages: mappedMessages
        });
    }

    return conversations;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content,
            is_read: false
        })
        .select()
        .single();

    // Update conversation's updated_at
    await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    return { data, error };
};

export const createConversation = async (participantIds: string[]) => {
    const { data, error } = await supabase
        .from('conversations')
        .insert({
            participant_ids: participantIds
        })
        .select()
        .single();

    return { data, error };
};
