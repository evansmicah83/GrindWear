import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../lib/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(sbUser: any, profile: any): User {
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: profile?.name || sbUser.user_metadata?.name || '',
    role: profile?.role === 'admin' ? 'admin' : 'user',
    avatar: profile?.avatar_url || undefined,
    phone: profile?.phone || undefined,
    createdAt: sbUser.created_at,
  };
}

/**
 * Fetches user profile from the users table.
 * Returns null if not found or if there's an error (RLS, network, etc.)
 * Does NOT throw errors - just returns null on failure.
 */
async function fetchProfileSafely(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,role,phone,avatar_url,created_at')
      .eq('id', userId)
      .maybeSingle();
    
    return data || null;
  } catch (err: any) {
    // Silently handle any errors (RLS, network, etc.)
    console.warn('Could not fetch user profile:', err?.message);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser(sbUser: any) {
    if (!sbUser) {
      setUser(null);
      return;
    }

    // Fetch profile from users table (with error handling)
    const profile = await fetchProfileSafely(sbUser.id);
    
    // Set user with profile if available, otherwise with just auth data
    setUser(mapUser(sbUser, profile));
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user ?? null).finally(() => setIsLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // Force Supabase auth initialization to surface detailed auth errors
    // eslint-disable-next-line no-console
    console.log('[AuthContext] attempting login for:', email?.trim());

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    // eslint-disable-next-line no-console
    console.log('[AuthContext] current session error:', sessionErr);
    // eslint-disable-next-line no-console
    console.log('[AuthContext] current session data:', sessionData);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    
    if (error) {
      // Enhanced error handling for Supabase auth errors
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('email not confirmed')) {
        throw new Error('Please confirm your email. Check your inbox for the confirmation link.');
      } else if (errorMsg.includes('invalid credentials') || errorMsg.includes('invalid login')) {
        throw new Error('Invalid email or password.');
      } else if (errorMsg.includes('user not found') || errorMsg.includes('does not exist')) {
        throw new Error('No account found with this email.');
      } else if (errorMsg.includes('disabled') || errorMsg.includes('banned')) {
        throw new Error('This account has been disabled.');
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
        throw new Error('Too many login attempts. Please wait and try again.');
      } else if (errorMsg.includes('weak password') || errorMsg.includes('password should')) {
        throw new Error('Password is too weak.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
    
    if (data.user) {
      await loadUser(data.user);
    }
  };

  const register = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password, 
      options: { 
        data: { name: name.trim() },
        emailRedirectTo: window.location.origin
      } 
    });
    
    if (error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('already registered') || errorMsg.includes('already exists') || errorMsg.includes('user already')) {
        throw new Error('An account with this email already exists. Please sign in.');
      } else if (errorMsg.includes('weak password') || errorMsg.includes('password should')) {
        throw new Error('Password must be at least 6 characters.');
      } else if (errorMsg.includes('invalid email') || errorMsg.includes('email format')) {
        throw new Error('Please enter a valid email address.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
    
    if (data.user) {
      await loadUser(data.user);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
