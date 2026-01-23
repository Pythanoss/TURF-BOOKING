import { createContext, useContext, useState, useEffect } from 'react';

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

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('turfBookingUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('turfBookingUser');
      }
    }
    setLoading(false);
  }, []);

  // Mock login function
  // TODO: Integrate Google OAuth with Supabase
  // Example: const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  const login = async (provider = 'google') => {
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data
    const mockUser = {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 98765 43210',
      avatar: null,
      provider: provider,
    };

    setUser(mockUser);
    setIsLoggedIn(true);
    localStorage.setItem('turfBookingUser', JSON.stringify(mockUser));
    setLoading(false);

    return { success: true, user: mockUser };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('turfBookingUser');
  };

  // Update user profile
  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('turfBookingUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
