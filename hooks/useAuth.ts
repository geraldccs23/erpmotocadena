import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { UserProfile, Role } from '../types';

const MOCK_PROFILE: UserProfile = {
  id: 'demo-id',
  workshop_id: 'workshop-1',
  full_name: 'Staff Motocadena (Admin)',
  email: 'admin@motocadena.com',
  role: 'DIRECTOR',
  is_active: true
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    try {
      // Intentar obtener el perfil real de la DB
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        console.log("✅ Perfil DB cargado:", data.full_name);
        setProfile(data as UserProfile);
      } else {
        console.warn("⚠️ No se halló perfil físico para este usuario, usando temporal.");
        setProfile({
          ...MOCK_PROFILE,
          id: userId,
          full_name: email.split('@')[0].toUpperCase(),
          email: email
        });
      }
    } catch (e) {
      console.error("Fallo crítico recuperando perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (initialized.current) return;
      initialized.current = true;

      if (localStorage.getItem('motocadena_demo_mode') === 'true') {
        setUser({ id: 'demo-user', email: 'demo@motocadena.com' });
        setProfile(MOCK_PROFILE);
        setLoading(false);
        return;
      }

      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (currentUser && !error) {
          setUser(currentUser);
          await fetchProfile(currentUser.id, currentUser.email || '');
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
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await fetchProfile(session.user.id, session.user.email || '');
        }
      } else {
        if (localStorage.getItem('motocadena_demo_mode') !== 'true') {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const loginDemo = () => {
    localStorage.setItem('motocadena_demo_mode', 'true');
    setUser({ id: 'demo-user', email: 'demo@motocadena.com' });
    setProfile(MOCK_PROFILE);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('motocadena_demo_mode');
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setProfile(null);
    setLoading(false);
    window.location.hash = '#/login';
  };

  const hasRole = (roles: Role[]) => profile && roles.includes(profile.role);

  return { user, profile, loading, hasRole, loginDemo, logout };
}