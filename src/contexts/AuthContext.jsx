import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const userData = await buildUser(session.user);
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await buildUser(session.user);
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Builds the app-level user object, merging auth metadata + profiles table (for phone)
  const buildUser = async (supabaseUser) => {
    let phone = null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      phone = profile?.phone || null;
    } catch {
      // Non-fatal — phone simply stays null
    }

    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
      email: supabaseUser.email,
      avatar: supabaseUser.user_metadata?.avatar_url || null,
      phone,
      provider: supabaseUser.app_metadata?.provider || 'google',
    };
  };

  const login = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Updates phone/name in the profiles table and refreshes the local user state
  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...(updates.name  && { name: updates.name }),
          ...(updates.phone && { phone: updates.phone }),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = { user, isLoggedIn, loading, login, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
