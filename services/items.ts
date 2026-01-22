import { supabase } from './supabase';
import { Item, ItemCategory, LogisticsType, User, UserType } from '../types';

export const ITEM_BUCKET_NAME = 'item-images';

export const fetchItems = async (): Promise<Item[]> => {
    const { data, error } = await supabase
        .from('items')
        .select(`
      *,
      owner:profiles (*)
    `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }

    return data.map(mapDbToItem);
};

export const getItemById = async (id: string): Promise<Item | null> => {
    const { data, error } = await supabase
        .from('items')
        .select(`
      *,
      owner:profiles (*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching item:', error);
        return null;
    }

    return mapDbToItem(data);
};

export const getItemsByUser = async (userId: string): Promise<Item[]> => {
    const { data, error } = await supabase
        .from('items')
        .select(`
      *,
      owner:profiles (*)
    `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching items by user:', error);
        return [];
    }

    return data.map(mapDbToItem);
};

export const createItem = async (itemData: any) => {
    const { data, error } = await supabase
        .from('items')
        .insert(itemData)
        .select()
        .single();
    return { data, error };
};

export const uploadItemImage = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
        .from(ITEM_BUCKET_NAME)
        .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(ITEM_BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrl;
};

// Helper to map DB result to Item interface
const mapDbToItem = (dbItem: any): Item => {
    const ownerData = dbItem.owner || {};

    const owner: User = {
        id: ownerData.id,
        name: ownerData.full_name || 'Unknown',
        email: ownerData.email || '',
        avatar: ownerData.avatar_url || 'https://via.placeholder.com/150',
        type: (ownerData.user_type as UserType) || UserType.REGULAR,
        rating: Number(ownerData.rating) || 0,
        reviews: Number(ownerData.reviews_count) || 0,
        location: ownerData.location || '',
        joinedDate: ownerData.joined_date,
        verified: !!ownerData.is_verified,
        isShop: !!ownerData.is_shop
    };

    return {
        id: dbItem.id,
        title: dbItem.title,
        description: dbItem.description,
        pricePerDay: Number(dbItem.price_per_day),
        category: (dbItem.category as ItemCategory) || ItemCategory.OTHERS,
        images: dbItem.images || [],
        owner: owner,
        location: dbItem.location || owner.location,
        condition: dbItem.condition || 'Good',
        isAvailable: dbItem.is_available,
        depositAmount: Number(dbItem.deposit_amount) || 0,
        logisticsType: LogisticsType.PICKUP_ONLY,
        allowSurvey: false
    };
};

export const updateItem = async (itemId: string, updates: Partial<Item>) => {
    // Map frontend updates to DB columns
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.pricePerDay) dbUpdates.price_per_day = updates.pricePerDay;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;

    const { data, error } = await supabase
        .from('items')
        .update(dbUpdates)
        .eq('id', itemId)
        .select();

    return { data, error };
};

export const deleteItem = async (itemId: string) => {
    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

    return { error };
};
