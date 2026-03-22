import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile, Role } from '../types';

interface AuthContextType {
    user: any;
    profile: UserProfile | null;
    workshopId: string | null;
    loading: boolean;
    hasRole: (roles: Role[]) => boolean;
    loginDemo: () => void;
    logout: () => Promise<void>;
    fetchProfile: (userId: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_PROFILE: UserProfile = {
    id: 'demo-id',
    workshop_id: 'workshop-1',
    full_name: 'Staff Motocadena (Admin)',
    email: 'admin@motocadena.com',
    role: 'DIRECTOR',
    is_active: true,
    commission_rate: 0
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [workshopId, setWorkshopId] = useState<string | null>(null);
    const initialized = useRef(false);
    const fetchingId = useRef<string | null>(null);
    const abortRetryTimeout = useRef<any>(null);

    const discoverWorkshop = async () => {
        try {
            const { data, error } = await (supabase.from('workshops') as any).select('id').limit(1).maybeSingle();
            if (data && !error) {
                setWorkshopId(data.id);
            }
        } catch (e) {
            console.error("❌ AuthContext: Failed workshop discovery:", e);
        }
    };

    const fetchProfile = useCallback(async (userId: string, email: string) => {
        if (fetchingId.current === userId) return;
        fetchingId.current = userId;

        const timeoutId = setTimeout(() => {
            if (loading && fetchingId.current === userId) {
                const fallback = { ...MOCK_PROFILE, id: userId, full_name: email.split('@')[0].toUpperCase(), email: email };
                setProfile(fallback);
                setWorkshopId(fallback.workshop_id);
                setLoading(false);
            }
        }, 8000);

        try {
            const { data, error } = await (supabase.from('user_profiles') as any).select('*').eq('id', userId).maybeSingle();
            clearTimeout(timeoutId);

            if (data && !error) {
                setProfile(data as UserProfile);
                setWorkshopId((data as any).workshop_id);
            } else if (!error) {
                await discoverWorkshop();
            }
        } catch (e: any) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError' || e.message?.includes('AbortError')) {
                console.warn("⚠️ AuthContext: Fetch aborted. Retrying in 1.5s...");
                if (abortRetryTimeout.current) clearTimeout(abortRetryTimeout.current);
                abortRetryTimeout.current = setTimeout(() => {
                    fetchingId.current = null;
                    fetchProfile(userId, email);
                }, 1500);
                return;
            }
        } finally {
            if (fetchingId.current === userId) {
                setLoading(false);
                fetchingId.current = null;
            }
        }
    }, [loading]);

    useEffect(() => {
        if (user && !profile && !loading && !fetchingId.current) {
            fetchProfile(user.id, user.email || '');
        }
    }, [user, profile, loading, fetchProfile]);

    useEffect(() => {
        const initAuth = async () => {
            if (initialized.current) return;
            initialized.current = true;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id, session.user.email || '');
                } else {
                    setLoading(false);
                }
            } catch (e) {
                setLoading(false);
            }
        };
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
                    await fetchProfile(session.user.id, session.user.email || '');
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setWorkshopId(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const loginDemo = () => {
        localStorage.setItem('motocadena_demo_mode', 'true');
        setUser({ id: 'demo-user', email: 'demo@motocadena.com' });
        setProfile(MOCK_PROFILE);
        setWorkshopId(MOCK_PROFILE.workshop_id);
        setLoading(false);
    };

    const logout = async () => {
        setLoading(true);
        localStorage.removeItem('motocadena_demo_mode');
        await supabase.auth.signOut().catch(() => { });
        setUser(null);
        setProfile(null);
        setWorkshopId(null);
        setLoading(false);
        window.location.hash = '#/admin/login';
    };

    const hasRole = (roles: Role[]) => {
        if (user && !profile) return true; // Permissive while loading profile to avoid UI chop
        return profile ? roles.includes(profile.role) : false;
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, workshopId, hasRole, loginDemo, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
