import { supabase } from './supabase';
import { Notification, NotificationType } from '../types';

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data.map(n => ({
        id: n.id,
        userId: n.user_id,
        type: n.type as NotificationType,
        title: n.title,
        message: n.message,
        read: n.is_read,
        createdAt: n.created_at,
        link: n.link,
        time: formatRelativeTime(n.created_at)
    }));
};

export const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    return { error };
};

export const createNotification = async (notif: Partial<Notification>) => {
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: notif.userId,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            link: notif.link
        })
        .select()
        .single();

    return { data, error };
};

// Helper
const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};
