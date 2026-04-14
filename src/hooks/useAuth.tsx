import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type AppRole = 'super_admin' | 'admin' | 'treasurer' | 'coach' | 'member';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, telephone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  profile: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!error && data) {
        setRoles(data.map((r) => r.role as AppRole));
      } else if (error) {
        console.error("Error fetching roles:", error);
      }
    } catch (err) {
      console.error("Unexpected error fetching roles:", err);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([
          fetchRoles(session.user.id),
          fetchProfile(session.user.id)
        ]).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
        fetchProfile(session.user.id);
      } else {
        setRoles([]);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, telephone?: string) => {
    setLoading(true);
    try {
      console.log('[AUTH] Tentative de création de demande pour:', email);

      // 1. Insertion de la demande (sans création de compte Auth immédiate)
      // On utilise 'as any' car les types Supabase n'ont pas encore été régénérés
      const { error: insertError } = await supabase
        .from('demandes')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          password_temp: password,
          telephone: telephone || null,
          status: 'pending'
        } as any);


      if (insertError) {
        throw insertError;
      }

      console.log('[AUTH] Demande d\'inscription enregistrée avec succès.');
      return { error: null };
    } catch (err: any) {
      console.error('[AUTH] Erreur lors de l\'inscription:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };






  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setProfile(null);
  };

  const isStaff = roles.some((r) => ['super_admin', 'admin', 'treasurer', 'coach'].includes(r));
  const isAdmin = roles.some((r) => ['super_admin', 'admin'].includes(r));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        isStaff,
        isAdmin,
        signUp,
        signIn,
        signOut,
        profile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
