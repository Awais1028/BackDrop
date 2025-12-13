import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateAndStoreDummyData } from '@/utils/dummyData'; // Import the dummy data generator

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
    console.log('AuthContext useEffect: Checking for users in localStorage...');
    let usersExist = false;
    try {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          usersExist = true;
        }
      }
    } catch (error) {
      console.error('AuthContext useEffect: Error parsing users from localStorage, treating as empty:', error);
      // If parsing fails here, treat as if no users exist, so dummy data will be generated
      usersExist = false;
      localStorage.removeItem('users'); // Clear potentially malformed data
    }

    if (!usersExist) {
      console.log('AuthContext useEffect: No valid users found, generating dummy data.');
      generateAndStoreDummyData();
      console.log('AuthContext useEffect: Dummy data generation function called.');
    } else {
      console.log('AuthContext useEffect: Users found in localStorage. Skipping dummy data generation.');
    }

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
        console.log(`AuthContext useEffect: Loaded current user: ${parsedUser.email} (${parsedUser.role})`);
      } catch (error) {
        console.error('AuthContext useEffect: Error parsing currentUser from localStorage:', error);
        localStorage.removeItem('currentUser'); // Clear invalid current user
      }
    } else {
      console.log('AuthContext useEffect: No current user found in localStorage.');
    }
  }, []);

  const login = (email: string, selectedRole: UserRole) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const existingUser = users.find(u => u.email === email && u.role === selectedRole);

    if (existingUser) {
      setUser(existingUser);
      setRole(existingUser.role);
      localStorage.setItem('currentUser', JSON.stringify(existingUser));
      console.log(`AuthContext login: User ${existingUser.name} (${existingUser.role}) logged in.`);
    } else {
      console.error('AuthContext login: Login failed: User not found or role mismatch.');
      alert('Login failed. Please register or check your credentials/role. If this is your first time, try refreshing the page to load dummy data.');
    }
  };

  const register = (name: string, email: string, selectedRole: UserRole) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      alert('User with this email already exists. Please log in.');
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
    console.log(`AuthContext register: User ${newUser.name} (${newUser.role}) registered and logged in.`);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('currentUser');
    console.log('AuthContext logout: User logged out.');
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