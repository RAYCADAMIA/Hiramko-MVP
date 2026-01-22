import { supabase } from './supabase';
import { User } from '../types';

export const updateProfile = async (userId: string, updates: Partial<User>) => {
    // Map frontend User to DB profile columns
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.gcashNumber) dbUpdates.gcash_number = updates.gcashNumber;
    if (updates.gcashName) dbUpdates.gcash_name = updates.gcashName;
    if (updates.verified !== undefined) dbUpdates.is_verified = updates.verified;

    const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select();

    return { data, error };
};
