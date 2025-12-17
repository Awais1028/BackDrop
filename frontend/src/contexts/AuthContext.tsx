import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string, formType: 'user' | 'operator') => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: string): UserRole => {
  if (!role) return 'Creator'; // Default or fallback
  // Handle "operator" -> "Operator"
  return (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) as UserRole;
};

const AuthProviderContent = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const normalizeUser = (userData: any): User => {
    if (userData.role) {
      userData.role = normalizeRole(userData.role);
    }
    // Flatten merchant profile if present
    if (userData.merchant_profile) {
      userData.minIntegrationFee = userData.merchant_profile.min_integration_fee;
      userData.eligibilityRules = userData.merchant_profile.eligibility_rules;
      userData.suitabilityRules = userData.merchant_profile.suitability_rules;
    }
    return userData as User;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.get<any>('/auth/me');
          const normalizedUser = normalizeUser(userData);
          setUser(normalizedUser);
          setRole(normalizedUser.role);
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem('token');
          setUser(null);
          setRole(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, formType: 'user' | 'operator') => {
    setIsLoading(true);
    try {
      const { access_token } = await api.post<{ access_token: string }>('/auth/login', { email, password });
      
      localStorage.setItem('token', access_token);
      
      // Fetch user details
      const userData = await api.get<any>('/auth/me');
      const normalizedUser = normalizeUser(userData);

      // Role validation
      if (formType === 'operator' && normalizedUser.role !== 'Operator') {
        toast.error('Access denied. This user is not an Operator.');
        // Ensure state is cleared before returning
        setUser(null);
        setRole(null);
        localStorage.removeItem('token');
        return;
      }
      if (formType === 'user' && normalizedUser.role === 'Operator') {
        toast.error('Access denied. Please use the Operator Login form.');
        // Ensure state is cleared before returning
        setUser(null);
        setRole(null);
        localStorage.removeItem('token');
        return;
      }

      setUser(normalizedUser);
      setRole(normalizedUser.role);
      toast.success(`Welcome back, ${normalizedUser.name}!`);

      // Redirect based on role
      switch (normalizedUser.role) {
        case 'Creator': navigate('/creator/scripts'); break;
        case 'Advertiser':
        case 'Merchant': navigate('/discover'); break;
        case 'Operator': navigate('/operator/inventory'); break;
        default: navigate('/'); break;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your email and password.');
    } finally {
        setIsLoading(false);
    }
  };

  const updateCurrentUser = async (updatedUser: User) => {
    try {
        const updatePayload: any = {};
        if (updatedUser.name) updatePayload.name = updatedUser.name;
        if (updatedUser.minIntegrationFee !== undefined) updatePayload.min_integration_fee = updatedUser.minIntegrationFee;
        if (updatedUser.eligibilityRules !== undefined) updatePayload.eligibility_rules = updatedUser.eligibilityRules;
        if (updatedUser.suitabilityRules !== undefined) updatePayload.suitability_rules = updatedUser.suitabilityRules;

        const response = await api.put<any>('/auth/me', updatePayload);
        const normalizedUser = normalizeUser(response);
        
        setUser(normalizedUser);
        setRole(normalizedUser.role);
    } catch (error) {
        console.error("Failed to update user profile", error);
        toast.error("Failed to save settings to server.");
    }
  };

  const register = async (name: string, email: string, password: string, selectedRole: UserRole) => {
    setIsLoading(true);
    try {
      await api.post('/auth/signup', { name, email, password, role: selectedRole.toLowerCase() });
      
      // Auto-login after registration
      await login(email, password, 'user');
      
      toast.success(`Account created for ${name}!`);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    toast.info('You have been logged out.');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, logout, register, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => (
  <AuthProviderContent>{children}</AuthProviderContent>
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};