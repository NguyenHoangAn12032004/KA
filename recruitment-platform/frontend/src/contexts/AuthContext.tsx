import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

// Define types
interface User {
  id: string;
  email: string;
  role: string;
  studentProfile?: any;
  companyProfile?: any;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  clearCacheAndReload: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verify token validity
      verifyToken();
    }
    setLoading(false);
  }, []);
  
  // Verify token validity
  const verifyToken = async () => {
    try {
      console.log('🔄 Verifying token validity...');
      const response = await authAPI.getCurrentUser();
      if (response.data?.success) {
        console.log('✅ Token is valid, user data:', response.data.data);
        // Update user data if needed
        updateUser(response.data.data);
      } else {
        console.warn('⚠️ Token verification failed, logging out');
        logout();
      }
    } catch (error) {
      console.error('❌ Token verification error:', error);
      // If token is invalid, logout
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login(email, password);
      console.log('🔍 Login response:', response);
      
      // Check success using data.success or direct user/token
      if ((response.data?.success && response.data?.data?.token && response.data?.data?.user) || 
          (response.data?.token && response.data?.user)) {
        
        // Get user and token from response structure
        let token, user;
        if (response.data?.success) {
          // Format: { success: true, data: { token, user } }
          token = response.data.data.token;
          user = response.data.data.user;
        } else {
          // Format: { token, user }
          token = response.data.token;
          user = response.data.user;
        }
        
        console.log('🔑 Token received');
        console.log('👤 User data received:', user);
        
        // Set state and localStorage
        setToken(token);
        setUser(user);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return;
      } else {
        console.error('🔒 Invalid response format:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối. Vui lòng thử lại sau.');
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await authAPI.register(userData);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Registration failed');
      }

      // Note: After registration, user needs to login
      return;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || error.message || 'Lỗi đăng ký. Vui lòng thử lại sau.');
    }
  };

  const logout = (): void => {
    console.log('🚪 Logging out user...');
    setUser(null);
    setToken(null);
    
    // Clear localStorage completely
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Also try to clear any other potential auth keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('token') || key.includes('user')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Auth data cleared, redirecting to home...');
    
    // Redirect to home page
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing user data from backend...');
      const response = await authAPI.getCurrentUser();
      if (response.data?.success) {
        console.log('✅ User data refreshed:', response.data);
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const clearCacheAndReload = (): void => {
    console.log('🧹 Clearing cache and reloading...');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any cached API responses
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Force reload the page
    window.location.reload();
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    clearCacheAndReload,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
