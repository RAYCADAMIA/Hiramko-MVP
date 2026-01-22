import { supabase } from './supabase';
import { Rental, RentalStatus, User, LogisticsType } from '../types';
import { getItemById } from './items';

export const getRentalsByUser = async (userId: string): Promise<Rental[]> => {
    const { data, error } = await supabase
        .from('rentals')
        .select(`
            *,
            item:items (*, owner:profiles(*)),
            renter:profiles (*)
        `)
        .or(`renter_id.eq.${userId},owner_id.eq.${userId}`) // Fetch if user is renter OR owner (owner_id logic might need check if it exists in rental table or inferred from item)
        // Actually rental table usually has renter_id. Owner is via item.
        // But supabase query '.or' across joined tables is tricky.
        // Simplified: fetch rentals where renter_id = userId.
        // AND fetch rentals for items owned by userId.
        // For now, let's assume 'rentals' has 'renter_id'.
        // To get rentals where I am the owner, I need to know which items I own.
        // This is complex in one query without a specific 'owner_id' column in rentals (which is redundant but helpful).
        // Let's check if rentals has owner_id. The schema Step 157 didn't show it explicitly but plans implied it.
        // If not, we might need two queries or a deep filter.
        // Let's try simple filter first: renter_id = userId
        // AND for owner: item.owner_id = userId.
        // Supabase supports filtering on joined tables: !inner join.
        // .select('*, item!inner(*)') .eq('item.owner_id', userId)
        ;

    // Strategy: Fetch where renter_id == me
    const { data: renterData, error: renterError } = await supabase
        .from('rentals')
        .select(`
            *,
            item:items (*, owner:profiles(*)),
            renter:profiles (*)
        `)
        .eq('renter_id', userId);

    if (renterError) console.error('Error fetching rentals as renter:', renterError);

    // Fetch where item owner == me
    // We need to find rentals where the item belongs to me.
    // Query rentals, join item, filter item by owner_id.
    const { data: ownerData, error: ownerError } = await supabase
        .from('rentals')
        .select(`
            *,
            item:items!inner (*, owner:profiles(*)),
            renter:profiles (*)
        `)
        .eq('item.owner_id', userId);

    if (ownerError) console.error('Error fetching rentals as owner:', ownerError);

    const allRentals = [...(renterData || []), ...(ownerData || [])];

    // Dedup by ID just in case
    const uniqueRentals = Array.from(new Map(allRentals.map(item => [item['id'], item])).values());

    return uniqueRentals.map(mapDbToRental);
};

export const createRental = async (rental: Partial<Rental>, renterId: string) => {
    // Map to DB
    const dbRental = {
        item_id: rental.item?.id,
        renter_id: renterId,
        start_date: rental.startDate,
        end_date: rental.endDate,
        total_price: rental.totalPrice,
        status: RentalStatus.PENDING,
        // payment_status?
    };

    const { data, error } = await supabase
        .from('rentals')
        .insert(dbRental)
        .select()
        .single();

    return { data, error };
};

export const updateRentalStatus = async (rentalId: string, status: RentalStatus) => {
    const { data, error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', rentalId)
        .select();

    return { data, error };
};

// Helper
const mapDbToRental = (dbRental: any): Rental => {
    return {
        id: dbRental.id,
        item: {
            // We need to map the item properly. 
            // Ideally we reuse mapDbToItem but locally here or import it?
            // Importing might cause circular dependency if items imports rentals.
            // items.ts imports nothing from rentals. So we can import mapHelper if exported?
            // or just manual map here.
            id: dbRental.item.id,
            title: dbRental.item.title,
            description: dbRental.item.description,
            pricePerDay: dbRental.item.price_per_day,
            images: dbRental.item.images || [],
            owner: {
                id: dbRental.item.owner.id,
                name: dbRental.item.owner.full_name,
                email: dbRental.item.owner.email,
                avatar: dbRental.item.owner.avatar_url,
                verified: dbRental.item.owner.is_verified,
                type: UserType.REGULAR,
                rating: dbRental.item.owner.rating || 0,
                reviews: 0,
                location: dbRental.item.owner.location,
                joinedDate: dbRental.item.owner.created_at
            },
            category: dbRental.item.category,
            condition: dbRental.item.condition,
            location: dbRental.item.location,
            isAvailable: dbRental.item.is_available,
            depositAmount: dbRental.item.deposit_amount,
            allowSurvey: false,
            logisticsType: LogisticsType.PICKUP_ONLY
        },
        renter: {
            id: dbRental.renter.id,
            name: dbRental.renter.full_name,
            email: dbRental.renter.email,
            avatar: dbRental.renter.avatar_url,
            verified: dbRental.renter.is_verified,
            type: UserType.REGULAR,
            rating: dbRental.renter.rating || 0,
            reviews: 0,
            location: dbRental.renter.location,
            joinedDate: dbRental.renter.created_at
        },
        startDate: dbRental.start_date,
        endDate: dbRental.end_date,
        totalPrice: dbRental.total_price,
        status: dbRental.status as RentalStatus,
        paymentStatus: 'pending', // default
        paymentProofUrl: dbRental.payment_proof_url
    };
};
