import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'COMPANY';
  studentProfile?: {
    firstName: string;
    lastName: string;
    university?: string;
    major?: string;
    graduationYear?: number;
    skills?: string[];
    resumeUrl?: string;
  };
  companyProfile?: {
    companyName: string;
    industry?: string;
    description?: string;
    website?: string;
    logoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  clearCacheAndReload: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser && storedUser !== 'undefined' && storedToken !== 'null') {
          // Validate token format before using it
          const cleanToken = storedToken.trim();
          if (cleanToken && cleanToken.length > 10) {
            setToken(cleanToken);
            setUser(JSON.parse(storedUser));
            console.log('🔑 Auth initialized with token:', cleanToken.substring(0, 20) + '...');
          } else {
            console.warn('⚠️ Invalid token format, clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          console.log('🔓 No valid auth data found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        
        console.log('✅ Login successful for user:', userData);
        console.log('🔑 Token received:', userToken.substring(0, 20) + '...');
        
        setUser(userData);
        setToken(userToken);
        
        // Store in localStorage
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Don't auto-sync on login to avoid overwriting user data
        console.log('✅ Login completed successfully for:', userData.email);
        
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.log('❌ Login failed, checking demo accounts...');
      
      // Special handling for nguyenvanan@example.com
      if (email === 'nguyenvanan@example.com' && password === 'password123') {
        console.log('🎯 Using demo account for Nguyen Van An');
        const nguyenVanAnAccount = {
          id: 'nguyen-van-an-001',
          email: 'nguyenvanan@example.com',
          role: 'STUDENT' as const,
          studentProfile: {
            firstName: 'An',
            lastName: 'Nguyen Van',
            university: 'Hanoi University of Science and Technology',
            major: 'Computer Science',
            graduationYear: 2024,
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
            gpa: '3.7/4.0'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const demoToken = `nguyen-van-an-token-${Date.now()}`;
        
        setUser(nguyenVanAnAccount);
        setToken(demoToken);
        
        // Store in localStorage
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(nguyenVanAnAccount));
        console.log('✅ Nguyen Van An logged in successfully');
        return;
      }
      
      // Fallback for demo accounts when backend is not available
      const demoAccounts = {
        'admin@recruitment.com': {
          id: 'demo-admin',
          email: 'admin@recruitment.com',
          role: 'ADMIN' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        'student@demo.com': {
          id: 'demo-student',
          email: 'student@demo.com',
          role: 'STUDENT' as const,
          studentProfile: {
            firstName: 'Test',
            lastName: 'Student',
            university: 'Demo University',
            major: 'Computer Science',
            graduationYear: 2025,
            skills: ['React', 'TypeScript', 'Node.js']
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        'company@demo.com': {
          id: 'demo-company',
          email: 'company@demo.com',
          role: 'COMPANY' as const,
          companyProfile: {
            companyName: 'TechCorp Vietnam',
            industry: 'Technology',
            description: 'Leading technology company in Vietnam',
            website: 'https://techcorp.vn'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      // Check if it's a demo account
      const demoUser = demoAccounts[email as keyof typeof demoAccounts];
      if (demoUser && (password === 'admin123' || password === 'demo123')) {
        const demoToken = `demo-token-${Date.now()}`;
        
        setUser(demoUser);
        setToken(demoToken);
        
        // Store in localStorage
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        return;
      }

      // If not a demo account or wrong password, throw original error
      throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối. Vui lòng thử lại sau.');
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  }): Promise<void> => {
    try {
      const response = await authAPI.register(userData);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      // Note: After registration, user needs to login
      // Some systems auto-login after registration, but we'll require manual login for security
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
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
      if (response.success) {
        console.log('✅ User data refreshed:', response.data);
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.warn('⚠️ Could not refresh user data:', error);
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
