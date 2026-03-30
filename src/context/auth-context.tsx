'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  privilege_tier: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, token: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, which can happen if the trigger failed or just signed up
          console.warn("Profile not found locally, using minimal fallback for user:", userId);
          return { id: userId, full_name: 'Architectural Member', privilege_tier: 'standard' } as Profile;
        }
        console.error("Error fetching profile:", error.message);
        return { id: userId, full_name: 'Architectural Member', privilege_tier: 'standard' } as Profile;
      }
      return data as Profile;
    } catch (error: any) {
      console.error("Error in fetchProfile:", error.message);
      return { id: userId, full_name: 'Architectural Member', privilege_tier: 'standard' } as Profile;
    }
  };

  const refreshProfileData = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  useEffect(() => {
    // Initial check
    const checkSession = async () => {
      if (!supabase) {
        console.warn("AuthContext: Supabase client is null. Verify .env.local keys.");
        setLoading(false);
        return;
      }
      
      try {
        console.log("AuthContext: Checking initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log("AuthContext: Initial session found for user:", currentUser.id);
          const p = await fetchProfile(currentUser.id);
          setProfile(p);
        } else {
          console.log("AuthContext: No initial session found.");
          setProfile(null);
        }
      } catch (err: any) {
        console.error("AuthContext: Error checking initial session:", err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Safety timeout for loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      console.log("AuthContext: Auth State Change Event:", _event);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const loginWithGoogle = async () => {
    if (!supabase) throw new Error("Supabase is not configured. Check your .env.local file.");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : ''
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!supabase) return;
    try {
      console.log("AuthContext: Initiating logout...");
      await supabase.auth.signOut({ scope: 'global' });
      
      // Explicitly clear the cookie (Double insurance)
      if (typeof document !== 'undefined') {
        document.cookie = "sb-livo-auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      }

      // Explicitly clear state to ensure UI updates immediately
      setUser(null);
      setProfile(null);
      console.log("AuthContext: Logout successful.");
    } catch (error) {
      console.error("AuthContext: Error signing out:", error);
      // Still clear state even if server-side signout fails
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    if (!supabase) throw new Error("Supabase is not configured. Check your .env.local file.");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  };

  const verifyOtp = async (phoneNumber: string, token: string) => {
    if (!supabase) throw new Error("Supabase is not configured. Check your .env.local file.");
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: token,
        type: 'sms',
      });
      if (error) throw error;
      return { data, error };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, sendOtp, verifyOtp, refreshProfile: refreshProfileData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
