import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateAndStoreDummyData } from '@/utils/dummyData'; // Import the dummy data generator
import { toast } from 'sonner'; // Import toast for notifications

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  register: (name: string, email: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    console.log('AuthContext useEffect: Initializing...');
    
    // Always attempt to generate dummy data if any essential part is missing
    generateAndStoreDummyData();

    const storedUser = localStorage.getItem('currentUser');
    console.log('AuthContext useEffect: Attempting to load currentUser from localStorage. Value:', storedUser);

    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
        console.log(`AuthContext useEffect: Loaded current user: ${parsedUser.email} (${parsedUser.role}). User state set.`);
      } catch (error) {
        console.error('AuthContext useEffect: Error parsing currentUser from localStorage:', error);
        localStorage.removeItem('currentUser'); // Clear invalid current user
        console.log('AuthContext useEffect: Invalid currentUser removed from localStorage.');
      }
    } else {
      console.log('AuthContext useEffect: No current user found in localStorage.');
    }
    console.log('AuthContext useEffect: Current user state after initial load:', user, 'Role:', role);
  }, []); // Empty dependency array means this runs once on mount

  const login = (email: string, selectedRole: UserRole) => {
    console.log(`AuthContext login: Attempting login for email: ${email}, role: ${selectedRole}`);
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const existingUser = users.find(u => u.email === email && u.role === selectedRole);

    if (existingUser) {
      setUser(existingUser);
      setRole(existingUser.role);
      localStorage.setItem('currentUser', JSON.stringify(existingUser));
      console.log(`AuthContext login: User ${existingUser.name} (${existingUser.role}) logged in. currentUser set in localStorage.`);
      toast.success(`Welcome back, ${existingUser.name}!`);
    } else {
      console.error('AuthContext login: Login failed: User not found or role mismatch.');
      toast.error('Login failed. Please check your email and role. If this is your first time, try refreshing the page and logging in with creator@example.com.');
    }
    console.log('AuthContext login: User state after login attempt:', user, 'Role:', role);
  };

  const register = (name: string, email: string, selectedRole: UserRole) => {
    console.log(`AuthContext register: Attempting registration for name: ${name}, email: ${email}, role: ${selectedRole}`);
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      toast.error('User with this email already exists. Please log in.');
      console.warn('AuthContext register: Registration failed, email already exists.');
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      role: selectedRole,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setUser(newUser);
    setRole(newUser.role);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    console.log(`AuthContext register: User ${newUser.name} (${newUser.role}) registered and logged in. currentUser set in localStorage.`);
    toast.success(`Account created for ${newUser.name}!`);
    console.log('AuthContext register: User state after registration:', user, 'Role:', role);
  };

  const logout = () => {
    console.log('AuthContext logout: Attempting logout.');
    setUser(null);
    setRole(null);
    localStorage.removeItem('currentUser');
    console.log('AuthContext logout: User logged out. currentUser removed from localStorage. User state cleared.');
    toast.info('You have been logged out.');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};