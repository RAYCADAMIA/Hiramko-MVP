import { supabase } from './supabase';
import { Item, ItemCategory, User, UserType, LogisticsType, Rental, RentalStatus, EscrowStatus, Review } from '../types';

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
    // REMOVED: Mock fallback removed for production launch
    return defaultValue;
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
        gcashNumber: profile.gcash_number || '0917-XXX-XXXX', // Default placeholder if missing
        gcashName: profile.gcash_name || profile.full_name || 'Owner Name',
    };
};

const mapDbItemToItem = (dbItem: any): Item => ({
    id: dbItem.id,
    title: dbItem.title,
    description: dbItem.description,
    pricePerDay: dbItem.price_per_day,
    category: dbItem.category as ItemCategory,
    images: dbItem.images || [],
    owner: mapProfileToUser(dbItem.profiles), // Requires join
    location: dbItem.location,
    condition: dbItem.condition,
    isAvailable: dbItem.is_available,
    depositAmount: dbItem.deposit_amount,
    logisticsType: (dbItem.logistics_type as LogisticsType) || LogisticsType.LIGHT,
    allowSurvey: dbItem.allow_survey || false,
});

// Demo Mode State
let isDemoMode = false;

export const setDemoMode = (enabled: boolean) => {
    console.log("Setting Demo Mode:", enabled);
    isDemoMode = enabled;
};

export const api = {
    // ITEMS
    getItems: async (): Promise<Item[]> => {
        const { data, error } = await supabase
            .from('items')
            .select(`
        *,
        profiles:owner_id (*)
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('API Error:', error);
            throw new Error('Failed to fetch items');
        }

        return (data || []).map(mapDbItemToItem);
    },

    getItemById: async (id: string): Promise<Item | null> => {
        const { data, error } = await supabase
            .from('items')
            .select(`
        *,
        profiles:owner_id (*)
      `)
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error("Supabase getItemById failed:", error);
            return null;
        }
        return mapDbItemToItem(data);
    },

    getMyItems: async (userId: string): Promise<Item[]> => {
        const { data, error } = await supabase
            .from('items')
            .select(`
                    *,
                    profiles:owner_id (*)
                `)
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase getMyItems failed:", error);
            return [];
        }

        return (data || []).map(mapDbItemToItem);
    },

    createItem: async (item: Omit<Item, 'id' | 'owner' | 'isAvailable'>, user: User) => {
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
                    allow_survey: item.allowSurvey
                })
                .select(`*, profiles:owner_id (*)`)
                .single();

            if (error) throw error;
            return mapDbItemToItem(data);
        } catch (err) {
            console.error("Supabase createItem failed:", err);
            throw err;
        }
    },

    updateItem: async (id: string, updates: Partial<Item>) => {
        // Implement real update if needed for MVP
        // For MVP launch, we might skip full edit or assume separate task
        return null;
    },

    // STORAGE (Images)
    uploadImage: async (file: File, bucket: 'item-images' | 'avatars' = 'item-images'): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload failed:", uploadError);
            throw new Error("Image upload failed");
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    },

    // RIDER / LOGISTICS
    getAvailableDeliveryJobs: async (): Promise<Rental[]> => {
        const rentals = getLocalStorage('hk_rentals', MOCK_RENTALS);
        return rentals.filter(r =>
            (r.status === RentalStatus.APPROVED || r.status === RentalStatus.RIDER_PICKUP) &&
            r.deliveryMethod === 'delivery'
        );
    },

    acceptDeliveryJob: async (rentalId: string, riderId: string) => {
        // In real backend: UPDATE rentals SET rider_id = riderId, status = 'RIDER_PICKUP' WHERE id = rentalId
        return { success: true };
    },

    updateDeliveryStatus: async (rentalId: string, status: RentalStatus, proofImage?: File) => {
        let proofUrl = '';
        if (proofImage) {
            proofUrl = await api.uploadImage(proofImage, 'item-images'); // Reusing bucket for prototype
        }

        // In real backend: UPDATE rentals SET status = status, pickup_proof/return_proof = proofUrl WHERE id = rentalId
        return { success: true, proofUrl };
    },

    createRental: async (rental: Omit<Rental, 'id' | 'status' | 'escrowStatus' | 'paymentStatus'>) => {
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

        if (error) throw error;
        // Construct basic rental object to return immediately (saves a join query for now)
        return {
            ...rental,
            id: data.id,
            status: RentalStatus.PENDING,
            escrowStatus: EscrowStatus.HELD,
            paymentStatus: 'unpaid',
        } as Rental;
    },

    submitPaymentProof: async (rentalId: string, proofString: string) => {
        // Upload proof first if it's a file? Assuming pre-uploaded URL passed here
        // If proofString is base64/blob from local, we need to handle that, but assuming URL.
        const { error } = await supabase
            .from('rentals')
            .update({
                payment_status: 'review',
                payment_proof_url: proofString,
            })
            .eq('id', rentalId);

        if (error) throw error;
        return { success: true };
    },

    updateRentalStatus: async (rentalId: string, status: RentalStatus) => {
        const { data, error } = await supabase
            .from('rentals')
            .update({ status })
            .eq('id', rentalId)
            .select()
            .single();

        if (error) throw error;
        return data as Rental;
    },

    // ESCROW & TRANSACTIONS
    // ESCROW & PAYMENT (MANUAL P2P)
    confirmPayment: async (rentalId: string) => {
        const { error } = await supabase
            .from('rentals')
            .update({
                payment_status: 'paid',
                status: RentalStatus.APPROVED // Auto-approve or kept separate? Let's auto-approve upon payment confirm
            })
            .eq('id', rentalId);
        if (error) throw error;
        return { success: true };
    },

    confirmReturn: async (rentalId: string, conditionRating: number, damaged: boolean) => {
        let status = damaged ? RentalStatus.DISPUTED : RentalStatus.COMPLETED;
        let escrow = damaged ? EscrowStatus.DISPUTED : EscrowStatus.RELEASED;

        // In real backend:
        // IF damaged: Freeze funds, notify admin.
        // IF !damaged: Release deposit to renter, release fee to owner.

        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, newStatus: status, escrowStatus: escrow };
    },

    fileDispute: async (rentalId: string, reason: string) => {
        // In real backend: Flag rental, freeze escrow, create admin ticket
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, status: RentalStatus.DISPUTED, escrow: EscrowStatus.DISPUTED };
    },

    // REVIEWS
    submitReview: async (review: Omit<Review, 'id' | 'createdAt'>) => {
        // In real backend: INSERT into reviews, recalculate avg rating for targetId
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true };
    },

    getReviewsForUser: async (userId: string): Promise<Review[]> => {
        // Mock data
        return [
            { id: 'r1', rentalId: 'rent1', reviewerId: 'u2', targetId: userId, rating: 5, comment: 'Great renter! smooth transaction.', createdAt: new Date().toISOString() },
            { id: 'r2', rentalId: 'rent2', reviewerId: 'u3', targetId: userId, rating: 4, comment: 'Good, but slightly late pickup.', createdAt: new Date().toISOString() }
        ];
    },

    // ADMIN
    resolveDispute: async (rentalId: string, decision: 'refund' | 'release_to_owner') => {
        // In real backend: Unlock escrow based on decision, update rental status
        await new Promise(resolve => setTimeout(resolve, 1000));

        let newStatus = decision === 'refund' ? RentalStatus.RETURN_INITIATED : RentalStatus.COMPLETED; // Refund = Cancelled essentially
        let escrowStatus = decision === 'refund' ? EscrowStatus.REFUNDED : EscrowStatus.RELEASED;

        if (decision === 'refund') {
            // If refunding, we assume transaction cancelled/money returned
            newStatus = RentalStatus.ACTIVE; // Or some specific cancelled state, for now reusing existing
        }

        return { success: true, newStatus, escrowStatus };
    },

    blockItem: async (itemId: string) => {
        // In real backend: UPDATE items SET is_available = false (or add is_blocked column)
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    }
};
