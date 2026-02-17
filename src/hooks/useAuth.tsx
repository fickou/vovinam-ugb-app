import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

type AppRole = 'super_admin' | 'admin' | 'treasurer' | 'coach' | 'member';

interface User {
  id: number;
  email: string;
  roles?: AppRole[];
}

interface AuthContextType {
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedRoles = localStorage.getItem('auth_roles');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedRoles) setRoles(JSON.parse(savedRoles));

    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      await api.post('/auth/signup.php', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.post('/auth/login.php', { email, password });

      setUser(data.user);
      setRoles(data.user.roles || []);

      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_roles', JSON.stringify(data.user.roles || []));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = () => {
    setUser(null);
    setRoles([]);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_roles');
  };

  const isStaff = roles.some(r => ['super_admin', 'admin', 'treasurer', 'coach'].includes(r));
  const isAdmin = roles.some(r => ['super_admin', 'admin'].includes(r));

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        loading,
        isStaff,
        isAdmin,
        signUp,
        signIn,
        signOut,
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
