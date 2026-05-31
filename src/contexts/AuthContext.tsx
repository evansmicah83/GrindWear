import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
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
    emailVerified: !!sbUser.email_confirmed_at,
    verificationSent: profile?.verification_sent || false,
  };
}

/**
 * Fetches user profile from the users table.
 * Returns null if not found or if there's an error (RLS, network, etc.)
 * Does NOT throw errors - just returns null on failure.
 */
async function fetchProfileSafely(userId: string, email?: string) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }
  
  try {
    // Try by ID first (standard foreign key relationship)
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,role,phone,avatar_url,created_at,verification_sent')
      .eq('id', userId)
      .maybeSingle();
    
    if (data) return data;
    
    // Fallback: try by email if ID doesn't match (for existing users)
    if (email) {
      const { data: emailData } = await supabase
        .from('users')
        .select('id,name,email,role,phone,avatar_url,created_at,verification_sent')
        .eq('email', email)
        .maybeSingle();
      
      if (emailData) return emailData;
    }
    
    return null;
  } catch (err: any) {
    // Silently handle any errors (RLS, network, etc.)
    console.warn('Could not fetch user profile:', err?.message);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  async function loadUser(sbUser: any) {
    if (!sbUser) {
      setUser(null);
      setIsVerified(false);
      return;
    }

    // Fetch profile from users table (with error handling)
    const profile = await fetchProfileSafely(sbUser.id, sbUser.email);
    
    // Debug logging for role issues
    console.log('[Auth] Auth user:', { id: sbUser.id, email: sbUser.email });
    console.log('[Auth] Profile from DB:', profile);
    
    // Set user with profile if available, otherwise with just auth data
    const mappedUser = mapUser(sbUser, profile);
    console.log('[Auth] Mapped user role:', mappedUser.role);
    
    setUser(mappedUser);
    setIsVerified(mappedUser.emailVerified || false);
  }

  useEffect(() => {
    // Guard against null supabase client when env vars are missing
    if (!isSupabaseConfigured || !supabase) {
      // eslint-disable-next-line no-console
      console.warn('[AuthProvider] Supabase client not configured. User authentication will be disabled.');
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user ?? null).finally(() => setIsLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // eslint-disable-next-line no-console
    console.log('[AuthContext] attempting login for:', email?.trim());

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Check your environment variables.');
    }

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
      // Log the full error for debugging
      console.error('[Supabase Auth Error]', {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      const errorMsg = error.message?.toLowerCase() || '';
      const errorCode = error?.code;
      const errorStatus = error?.status;
      
      // Email not verified - Supabase returns 400 with 'invalid_credentials' for unverified emails
      if (errorMsg.includes('email not confirmed') ||
          errorMsg.includes('not confirmed') ||
          errorMsg.includes('unconfirmed') ||
          errorMsg.includes('verify') ||
          errorMsg.includes('confirmation') ||
          (errorCode === 'invalid_credentials' && errorStatus === 400)) {
        
        throw new Error(
          '❌ EMAIL NOT VERIFIED - You MUST disable email confirmation in Supabase! ' +
          'Go to: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/auth/settings ' +
          '→ Toggle OFF "Enable email confirmations" → Save → Redeploy Vercel'
        );
      }
      else if (errorMsg.includes('invalid credentials') || errorMsg.includes('invalid login')) {
        throw new Error('Invalid email or password.');
      } else if (errorMsg.includes('user not found') || errorMsg.includes('does not exist')) {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (errorMsg.includes('disabled') || errorMsg.includes('banned')) {
        throw new Error('This account has been disabled.');
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
        throw new Error('Too many login attempts. Please wait 5 minutes and try again.');
      } else if (errorMsg.includes('weak password') || errorMsg.includes('password should')) {
        throw new Error('Password is too weak. Must be at least 6 characters.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
    
    if (data.user) {
      await loadUser(data.user);
    }
  };

  const register = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Check your environment variables.');
    }
    
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
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
    }
    await supabase.auth.signOut();
    setUser(null);
    setIsVerified(false);
  };

  const resendVerificationEmail = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    // Use the regular auth client to resend OTP (works with anon key)
    const { error } = await supabase.auth.resendOtp({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('[Auth] Error resending verification:', error);
      throw new Error(error.message || 'Failed to send verification email. Please try again.');
    }

    // Mark in users table that verification was sent
    if (user?.id) {
      await supabase
        .from('users')
        .update({ verification_sent: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .catch((err) => console.warn('Could not update verification_sent:', err));
    }

    console.log('[Auth] Verification email resent successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      isVerified,
      login, 
      register, 
      logout,
      resendVerificationEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
