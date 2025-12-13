import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateAndStoreDummyData } from '@/utils/dummyData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string, formType: 'user' | 'operator') => void;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderContent = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    generateAndStoreDummyData();
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, formType: 'user' | 'operator') => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const existingUser = users.find(u => u.email === email);

    if (existingUser && existingUser.password === password) {
      // Role validation based on form type
      if (formType === 'operator' && existingUser.role !== 'Operator') {
        toast.error('Access denied. This user is not an Operator.');
        return;
      }
      if (formType === 'user' && existingUser.role === 'Operator') {
        toast.error('Access denied. Please use the Operator Login form.');
        return;
      }

      setUser(existingUser);
      setRole(existingUser.role);
      localStorage.setItem('currentUser', JSON.stringify(existingUser));
      toast.success(`Welcome back, ${existingUser.name}!`);
      
      // Redirect based on role
      switch (existingUser.role) {
        case 'Creator': navigate('/creator/scripts'); break;
        case 'Advertiser':
        case 'Merchant': navigate('/discover'); break;
        case 'Operator': navigate('/operator/inventory'); break;
        default: navigate('/'); break;
      }
    } else {
      toast.error('Login failed. Please check your email and password.');
    }
  };

  const updateCurrentUser = (updatedUser: User) => {
    setUser(updatedUser);
    setRole(updatedUser.role);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const register = (name: string, email: string, password: string, selectedRole: UserRole) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      toast.error('User with this email already exists. Please log in.');
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password,
      role: selectedRole,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setUser(newUser);
    setRole(newUser.role);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    toast.success(`Account created for ${newUser.name}!`);
    
    // Redirect based on role
    switch (newUser.role) {
      case 'Creator': navigate('/creator/scripts'); break;
      case 'Advertiser':
      case 'Merchant': navigate('/discover'); break;
      default: navigate('/'); break;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('currentUser');
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