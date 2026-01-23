import { supabase } from './supabase';
import { Item, ItemCategory, User, UserType, LogisticsType, Rental, RentalStatus, EscrowStatus, Review, ChatMessage, Conversation, Notification, NotificationType } from '../types';

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
};

const setLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};


export const mapProfileToUser = (profile: any): User => {
    if (!profile) {
        return {
            id: 'unknown',
            name: 'Unknown User',
            email: '',
            avatar: 'https://via.placeholder.com/150',
            type: UserType.REGULAR,
            rating: 0,
            reviews: 0,
            location: 'Unknown',
            joinedDate: new Date().toISOString(),
            verified: false,
            isShop: false,
        };
    }
    return {
        id: profile.id,
        name: profile.full_name || 'Anonymous',
        email: profile.email || '',
        avatar: profile.avatar_url || 'https://via.placeholder.com/150',
        type: (profile.user_type as UserType) || UserType.REGULAR,
        rating: Number(profile.rating) || 0,
        reviews: profile.reviews_count || 0,
        location: profile.location || 'Davao City',
        joinedDate: profile.joined_date || new Date().toISOString(),
        verified: profile.is_verified || false,
        isShop: profile.is_shop || false,
        escrowBalance: Number(profile.escrow_balance) || 0,
        gcashNumber: profile.gcash_number || '',
        gcashName: profile.gcash_name || profile.full_name || 'Owner Name',
    };
};

const mapDbRentalToRental = (dbRental: any): Rental => ({
    id: dbRental.id,
    item: mapDbItemToItem(dbRental.item),
    renter: mapProfileToUser(dbRental.renter),
    startDate: dbRental.start_date,
    endDate: dbRental.end_date,
    status: dbRental.status as RentalStatus,
    totalPrice: dbRental.total_price,
    paymentStatus: dbRental.payment_status || 'unpaid',
    paymentProofUrl: dbRental.payment_proof_url,
    deliveryMethod: dbRental.delivery_method || 'pickup',
    escrowStatus: dbRental.escrow_status as EscrowStatus
});

const mapDbItemToItem = (dbItem: any): Item => ({
    id: dbItem.id,
    title: dbItem.title,
    description: dbItem.description,
    pricePerDay: Number(dbItem.price_per_day),
    category: dbItem.category as ItemCategory,
    images: dbItem.images || [],
    owner: mapProfileToUser(dbItem.profiles), // Requires join
    location: dbItem.location,
    condition: dbItem.condition,
    isAvailable: dbItem.is_available,
    depositAmount: Number(dbItem.deposit_amount),
    logisticsType: (dbItem.logistics_type as LogisticsType) || LogisticsType.LIGHT,
    allowSurvey: dbItem.allow_survey || false,
    createdAt: dbItem.created_at || new Date().toISOString(),
});

// Demo Mode State
let isDemoMode = false;

export const setDemoMode = (enabled: boolean) => {
    isDemoMode = enabled;
};

export const api = {
    // ITEMS
    getItems: async (): Promise<Item[]> => {
        const localItems = getLocalStorage<Item[]>('hk_items', []);

        try {
            const { data, error } = await supabase
                .from('items')
                .select(`
                    *,
                    profiles:owner_id (*)
                `)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const dbItems = data.map(mapDbItemToItem);
                // Merge local and DB items for the demo loop
                const allItems = [...dbItems];
                localItems.forEach(li => {
                    if (!allItems.find(oi => oi.id === li.id)) {
                        allItems.push(li);
                    }
                });
                return allItems;
            }
        } catch (err) {
            console.warn("Supabase getItems failed, using local fallback:", err);
        }

        return localItems;
    },

    getItemById: async (id: string): Promise<Item | null> => {
        try {
            const { data, error } = await supabase
                .from('items')
                .select(`
                    *,
                    profiles:owner_id (*)
                `)
                .eq('id', id)
                .single();

            if (!error && data) {
                return mapDbItemToItem(data);
            }
        } catch (err) {
            console.warn("Supabase getItemById failed, checking local:", err);
        }

        const localItems = getLocalStorage<Item[]>('hk_items', []);
        return localItems.find(i => i.id === id) || null;
    },

    getMyItems: async (userId: string): Promise<Item[]> => {
        const localItems = getLocalStorage<Item[]>('hk_items', []);
        const userLocalItems = localItems.filter(li => li.owner.id === userId);

        try {
            const { data, error } = await supabase
                .from('items')
                .select(`
                        *,
                        profiles:owner_id (*)
                    `)
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const dbItems = data.map(mapDbItemToItem);
                const allMyItems = [...dbItems];
                userLocalItems.forEach(li => {
                    if (!allMyItems.find(oi => oi.id === li.id)) {
                        allMyItems.push(li);
                    }
                });
                return allMyItems;
            }
        } catch (err) {
            console.warn("Supabase getMyItems failed, using local fallback:", err);
        }

        return userLocalItems;
    },

    createItem: async (item: Omit<Item, 'id' | 'owner' | 'isAvailable'>, user: User) => {
        const items = getLocalStorage<Item[]>('hk_items', []);

        try {
            const { data, error } = await supabase
                .from('items')
                .insert({
                    owner_id: user.id,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    price_per_day: item.pricePerDay,
                    deposit_amount: item.depositAmount,
                    condition: item.condition,
                    location: item.location,
                    images: item.images,
                    logistics_type: item.logisticsType,
                    allow_survey: item.allowSurvey,
                    is_available: true
                })
                .select(`*, profiles:owner_id (*)`)
                .single();

            if (!error && data) {
                const mapped = mapDbItemToItem(data);
                items.push(mapped);
                setLocalStorage('hk_items', items);
                return mapped;
            }
        } catch (err) {
            console.warn("Supabase createItem failed, using local fallback:", err);
        }

        const newItem: Item = {
            ...item,
            id: `item_${Date.now()}`,
            owner: user,
            isAvailable: true
        };
        items.push(newItem);
        setLocalStorage('hk_items', items);
        return newItem;
    },

    updateItem: async (id: string, updates: Partial<Item>) => {
        try {
            const { data, error } = await supabase
                .from('items')
                .update({
                    title: updates.title,
                    description: updates.description,
                    category: updates.category,
                    price_per_day: updates.pricePerDay,
                    deposit_amount: updates.depositAmount,
                    condition: updates.condition,
                    location: updates.location,
                    images: updates.images,
                    logistics_type: updates.logisticsType,
                    allow_survey: updates.allowSurvey,
                    is_available: updates.isAvailable
                })
                .eq('id', id)
                .select(`*, profiles:owner_id (*)`)
                .single();

            if (!error && data) {
                const mapped = mapDbItemToItem(data);
                const items = getLocalStorage<Item[]>('hk_items', []);
                const idx = items.findIndex(i => i.id === id);
                if (idx > -1) {
                    items[idx] = mapped;
                    setLocalStorage('hk_items', items);
                }
                return mapped;
            } else if (error) {
                console.error("Supabase updateItem error:", error);
            }
        } catch (err) {
            console.warn("Supabase updateItem failed:", err);
        }

        const items = getLocalStorage<Item[]>('hk_items', []);
        const idx = items.findIndex(i => i.id === id);
        if (idx > -1) {
            items[idx] = { ...items[idx], ...updates };
            setLocalStorage('hk_items', items);
            return items[idx];
        }
        return null;
    },

    deleteItem: async (id: string) => {
        try {
            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.warn("Supabase deleteItem failed:", err);
        }

        const items = getLocalStorage<Item[]>('hk_items', []);
        const filtered = items.filter(i => i.id !== id);
        setLocalStorage('hk_items', filtered);
        return { success: true };
    },

    // STORAGE (Images)
    uploadImage: async (file: File, bucket: 'item-images' | 'avatars' = 'item-images'): Promise<string> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            return data.publicUrl;
        } catch (err) {
            console.warn(`Supabase Storage failed (${bucket}), using local DataURL fallback:`, err);
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        }
    },

    // RENTALS
    createRental: async (rental: Omit<Rental, 'id' | 'status' | 'escrowStatus' | 'paymentStatus'>) => {
        const rentals = getLocalStorage<Rental[]>('hk_rentals', []);

        try {
            const { data, error } = await supabase
                .from('rentals')
                .insert({
                    item_id: rental.item.id,
                    renter_id: rental.renter.id,
                    owner_id: rental.item.owner.id,
                    start_date: rental.startDate,
                    end_date: rental.endDate,
                    total_price: rental.totalPrice,
                    status: RentalStatus.PENDING,
                    payment_status: 'unpaid',
                })
                .select()
                .single();

            if (!error && data) {
                const newRental = {
                    ...rental,
                    id: data.id,
                    status: RentalStatus.PENDING,
                    escrowStatus: EscrowStatus.HELD,
                    paymentStatus: 'unpaid',
                } as Rental;
                rentals.push(newRental);
                setLocalStorage('hk_rentals', rentals);
                return newRental;
            }
        } catch (err) {
            console.warn("Supabase createRental failed:", err);
        }

        const locRental: Rental = {
            ...rental,
            id: `rent_${Date.now()}_local`,
            status: RentalStatus.PENDING,
            escrowStatus: EscrowStatus.HELD,
            paymentStatus: 'unpaid'
        } as Rental;
        rentals.push(locRental);
        setLocalStorage('hk_rentals', rentals);
        return locRental;
    },

    getRentals: async (userId: string): Promise<Rental[]> => {
        const localRentals = getLocalStorage<Rental[]>('hk_rentals', []);

        try {
            const { data: renterData } = await supabase
                .from('rentals')
                .select(`*, item:items!inner(*, profiles:owner_id (*)), renter:profiles(*)`)
                .eq('renter_id', userId);

            const { data: ownerData } = await supabase
                .from('rentals')
                .select(`*, item:items!inner(*, profiles:owner_id (*)), renter:profiles(*)`)
                .eq('item.owner_id', userId);

            const dbRentals = [...(renterData || []), ...(ownerData || [])].map((r: any) => ({
                id: r.id,
                item: mapDbItemToItem(r.item),
                renter: mapProfileToUser(r.renter),
                startDate: r.start_date,
                endDate: r.end_date,
                status: r.status as RentalStatus,
                totalPrice: r.total_price,
                paymentStatus: r.payment_status as any,
                paymentProofUrl: r.payment_proof_url,
                deliveryMethod: r.delivery_method || 'pickup',
                escrowStatus: r.escrow_status as EscrowStatus
            }));

            const allRentals = [...dbRentals];
            localRentals.forEach(lr => {
                if (!allRentals.find(ar => ar.id === lr.id)) allRentals.push(lr);
            });

            return allRentals;
        } catch (err) {
            console.warn("Supabase getRentals failed:", err);
            return localRentals;
        }
    },

    // NOTIFICATIONS
    getNotifications: async (userId: string): Promise<Notification[]> => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(n => ({
                id: n.id,
                userId: n.user_id,
                type: n.type as NotificationType,
                title: n.title,
                message: n.message,
                read: n.is_read,
                createdAt: n.created_at,
                link: n.link,
                time: api.formatRelativeTime(n.created_at)
            }));
        } catch (err) {
            console.warn("Supabase getNotifications failed:", err);
            return [];
        }
    },

    markAsRead: async (notificationId: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    },

    formatRelativeTime: (dateString: string) => {
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
    },

    // MESSAGING
    getOrCreateConversation: async (participantIds: string[]): Promise<string> => {
        try {
            const { data: existing } = await supabase
                .from('conversations')
                .select('id, participant_ids')
                .contains('participant_ids', participantIds);

            const match = existing?.find(c => c.participant_ids?.length === participantIds.length);
            if (match) return match.id;

            const { data: created, error } = await supabase
                .from('conversations')
                .insert({ participant_ids: participantIds })
                .select()
                .single();

            if (error) throw error;
            return created.id;
        } catch (err) {
            console.warn("Supabase getOrCreateConversation failed:", err);
            return `conv_${Date.now()}`;
        }
    },

    // REVIEWS & DISPUTES
    submitReview: async (review: Omit<Review, 'id' | 'createdAt'>) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    rental_id: review.rentalId,
                    reviewer_id: review.reviewerId,
                    target_id: review.targetId,
                    rating: review.rating,
                    comment: review.comment
                });
            if (error) throw error;
        } catch (err) {
            console.warn("Supabase submitReview failed:", err);
        }
    },

    fileDispute: async (rentalId: string, reason: string) => {
        try {
            const { error } = await supabase
                .from('rentals')
                .update({
                    status: RentalStatus.DISPUTED,
                    escrow_status: EscrowStatus.DISPUTED,
                    dispute_reason: reason
                })
                .eq('id', rentalId);
            if (error) throw error;
        } catch (err) {
            console.warn("Supabase fileDispute failed, updating locally:", err);
            const rentals = getLocalStorage<Rental[]>('hk_rentals', []);
            const idx = rentals.findIndex(r => r.id === rentalId);
            if (idx > -1) {
                rentals[idx] = {
                    ...rentals[idx],
                    status: RentalStatus.DISPUTED,
                    escrowStatus: EscrowStatus.DISPUTED,
                    disputeReason: reason
                };
                setLocalStorage('hk_rentals', rentals);
            }
        }
    },

    resolveDispute: async (rentalId: string, decision: 'refund' | 'release_to_owner') => {
        try {
            const status = decision === 'refund' ? EscrowStatus.REFUNDED : EscrowStatus.RELEASED;
            const rentalStatus = decision === 'refund' ? RentalStatus.RETURN_INITIATED : RentalStatus.COMPLETED;

            const { error } = await supabase
                .from('rentals')
                .update({
                    status: rentalStatus,
                    escrow_status: status
                })
                .eq('id', rentalId);
            if (error) throw error;
        } catch (err) {
            console.warn("Supabase resolveDispute failed, updating locally:", err);
            const rentals = getLocalStorage<Rental[]>('hk_rentals', []);
            const idx = rentals.findIndex(r => r.id === rentalId);
            if (idx > -1) {
                rentals[idx] = {
                    ...rentals[idx],
                    status: decision === 'refund' ? RentalStatus.RETURN_INITIATED : RentalStatus.COMPLETED,
                    escrowStatus: decision === 'refund' ? EscrowStatus.REFUNDED : EscrowStatus.RELEASED
                };
                setLocalStorage('hk_rentals', rentals);
            }
        }
    },

    // RENTAL STATUS MGMT
    confirmPayment: async (rentalId: string) => {
        try {
            const { error } = await supabase
                .from('rentals')
                .update({
                    status: RentalStatus.APPROVED,
                    payment_status: 'paid',
                    escrow_status: EscrowStatus.HELD
                })
                .eq('id', rentalId);
            if (error) throw error;
        } catch (err) {
            console.warn("Supabase confirmPayment failed, updating locally:", err);
            const rentals = getLocalStorage<Rental[]>('hk_rentals', []);
            const idx = rentals.findIndex(r => r.id === rentalId);
            if (idx > -1) {
                rentals[idx] = {
                    ...rentals[idx],
                    status: RentalStatus.APPROVED,
                    paymentStatus: 'paid',
                    escrowStatus: EscrowStatus.HELD
                };
                setLocalStorage('hk_rentals', rentals);
            }
        }
    },

    updateRentalStatus: async (rentalId: string, status: RentalStatus) => {
        try {
            const { error } = await supabase
                .from('rentals')
                .update({ status })
                .eq('id', rentalId);
            if (error) throw error;
        } catch (err) {
            console.warn("Supabase updateRentalStatus failed, updating locally:", err);
            const rentals = getLocalStorage<Rental[]>('hk_rentals', []);
            const idx = rentals.findIndex(r => r.id === rentalId);
            if (idx > -1) {
                rentals[idx] = { ...rentals[idx], status };
                setLocalStorage('hk_rentals', rentals);
            }
        }
    },

    blockItem: async (itemId: string) => {
        try {
            const { error } = await supabase
                .from('items')
                .update({ is_available: false })
                .eq('id', itemId);
            if (error) throw error;
        } catch (err) {
            console.warn("Supabase blockItem failed, updating locally:", err);
            const items = getLocalStorage<Item[]>('hk_items', []);
            const idx = items.findIndex(i => i.id === itemId);
            if (idx > -1) {
                items[idx].isAvailable = false;
                setLocalStorage('hk_items', items);
            }
        }
    },

    // Auth & Misc
    confirmReturn: async (rentalId: string, rating: number, damaged: boolean) => {
        try {
            const { error } = await supabase
                .from('rentals')
                .update({
                    status: RentalStatus.COMPLETED,
                    escrow_status: EscrowStatus.RELEASED
                })
                .eq('id', rentalId);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.warn("Supabase confirmReturn failed, updating locally:", err);
            const rentals = getLocalStorage<Rental[]>('hk_rentals', []);
            const idx = rentals.findIndex(r => r.id === rentalId);
            if (idx > -1) {
                rentals[idx] = {
                    ...rentals[idx],
                    status: RentalStatus.COMPLETED,
                    escrowStatus: EscrowStatus.RELEASED
                };
                setLocalStorage('hk_rentals', rentals);
                return { success: true };
            }
            return { success: false };
        }
    },

    topUpEscrow: async (userId: string, amount: number) => {
        try {
            // 1. Get current balance
            const { data: profile, error: getError } = await supabase
                .from('profiles')
                .select('escrow_balance')
                .eq('id', userId)
                .single();

            if (getError) throw getError;

            const newBalance = (Number(profile.escrow_balance) || 0) + amount;

            // 2. Update balance
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ escrow_balance: newBalance })
                .eq('id', userId);

            if (updateError) throw updateError;
            return { success: true, newBalance };
        } catch (err) {
            console.warn("Supabase topUpEscrow failed, using local fallback:", err);
            return { success: true }; // Silent success for demo
        }
    },

    submitPaymentProof: async (rentalId: string, proofUrl: string) => {
        try {
            const { error } = await supabase
                .from('rentals')
                .update({
                    payment_proof_url: proofUrl,
                    payment_status: 'paid',
                    status: RentalStatus.PENDING // Still pending owner approval but with proof
                })
                .eq('id', rentalId);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.warn("Supabase submitPaymentProof failed:", err);
            return { success: true };
        }
    }
};
