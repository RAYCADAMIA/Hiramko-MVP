import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User, UserType } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    loginAsDemo: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string, email: string) => {
        try {
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // If profile doesn't exist, create it (common for new OAuth users)
            if (error && error.code === 'PGRST116') {
                const { data: newData, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        full_name: email.split('@')[0],
                        email: email,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
                        user_type: UserType.REGULAR,
                        location: 'Davao City',
                        rating: 5.0,
                        reviews_count: 0,
                        is_verified: false,
                        is_shop: false,
                        joined_date: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                data = newData;
            } else if (error) {
                throw error;
            }

            if (data) {
                // Manual mapping with extreme safety defaults
                const appUser: User = {
                    id: data.id || userId,
                    name: data.full_name || email.split('@')[0] || 'User',
                    email: email || '',
                    avatar: data.avatar_url || 'https://via.placeholder.com/150',
                    type: (data.user_type as UserType) || UserType.REGULAR,
                    rating: Number(data.rating) || 0,
                    reviews: data.reviews_count || 0,
                    location: data.location || 'Davao City',
                    joinedDate: data.joined_date ? new Date(data.joined_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    verified: !!data.is_verified,
                    isShop: !!data.is_shop,
                    escrowBalance: Number(data.escrow_balance) || 0,
                };
                setUser(appUser);
            }
        } catch (err) {
            console.error('CRITICAL ERROR in fetchProfile:', err);
            // Fallback user to prevent crash
            const fallbackUser: User = {
                id: userId,
                name: email.split('@')[0],
                email: email,
                avatar: 'https://via.placeholder.com/150',
                type: UserType.REGULAR,
                rating: 0,
                reviews: 0,
                location: 'Unknown',
                joinedDate: new Date().toISOString(),
                verified: false,
                isShop: false,
            };
            setUser(fallbackUser);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email!);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email!);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Demo Mode Logic
    const loginAsDemo = async () => {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const demoUser: User = {
            id: 'demo_user_123',
            name: 'Demo User',
            email: 'demo@hiramko.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            type: UserType.REGULAR, // Give them verified status to test features
            rating: 4.8,
            reviews: 12,
            location: 'Davao City (Demo)',
            joinedDate: new Date().toISOString(),
            verified: true,
            isShop: false,
            escrowBalance: 5000, // Give some fake money
        };

        setUser(demoUser);
        import('../services/api').then(({ setDemoMode }) => setDemoMode(true));
        setLoading(false);
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('OAuth Error:', error.message);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        import('../services/api').then(({ setDemoMode }) => setDemoMode(false));
    };

    const refreshProfile = async () => {
        if (user) {
            if (user.id.startsWith('demo_')) return; // No refresh for demo user

            // Re-fetch logic using current user ID
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email!);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, refreshProfile, loginAsDemo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
