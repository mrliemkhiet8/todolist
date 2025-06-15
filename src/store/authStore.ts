import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  fetchProfile: () => Promise<void>;
}

// Email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Mock users storage
const USERS_STORAGE_KEY = 'taskflow_users';
const CURRENT_USER_KEY = 'taskflow_current_user';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

const getStoredUsers = (): StoredUser[] => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const findUserByEmail = (email: string): StoredUser | null => {
  const users = getStoredUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

const createUser = (email: string, password: string): StoredUser => {
  const users = getStoredUsers();
  const newUser: StoredUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase(),
    password,
    name: email.split('@')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveStoredUsers(users);
  return newUser;
};

const updateUserPassword = (userId: string, newPassword: string): boolean => {
  const users = getStoredUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) return false;
  
  users[userIndex].password = newPassword;
  users[userIndex].updated_at = new Date().toISOString();
  saveStoredUsers(users);
  return true;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!email.trim()) {
            throw new Error('Email is required');
          }
          if (!password) {
            throw new Error('Password is required');
          }
          if (!isValidEmail(email.trim())) {
            throw new Error('Please enter a valid email address');
          }

          const storedUser = findUserByEmail(email.trim());
          
          if (!storedUser || storedUser.password !== password) {
            throw new Error('Invalid email or password. Please check your credentials.');
          }

          const user: User = {
            id: storedUser.id,
            email: storedUser.email,
            created_at: storedUser.created_at,
          };

          const profile: Profile = {
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            avatar_url: storedUser.avatar_url,
            created_at: storedUser.created_at,
            updated_at: storedUser.updated_at,
          };

          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          set({ user, profile, isLoading: false });
        } catch (error: any) {
          console.error('Login error:', error);
          set({ 
            error: error.message || 'Login failed. Please check your credentials.', 
            isLoading: false 
          });
        }
      },

      signup: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!email.trim()) {
            throw new Error('Email is required');
          }
          if (!password) {
            throw new Error('Password is required');
          }
          if (!isValidEmail(email.trim())) {
            throw new Error('Please enter a valid email address');
          }
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }

          const existingUser = findUserByEmail(email.trim());
          if (existingUser) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          }

          const storedUser = createUser(email.trim(), password);

          const user: User = {
            id: storedUser.id,
            email: storedUser.email,
            created_at: storedUser.created_at,
          };

          const profile: Profile = {
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            avatar_url: storedUser.avatar_url,
            created_at: storedUser.created_at,
            updated_at: storedUser.updated_at,
          };

          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          set({ user, profile, isLoading: false });
        } catch (error: any) {
          console.error('Signup error:', error);
          set({ 
            error: error.message || 'Signup failed. Please try again.', 
            isLoading: false 
          });
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { user } = get();
          if (!user) {
            throw new Error('Not authenticated');
          }

          const storedUser = findUserByEmail(user.email);
          if (!storedUser || storedUser.password !== currentPassword) {
            throw new Error('Current password is incorrect');
          }

          const success = updateUserPassword(user.id, newPassword);
          if (!success) {
            throw new Error('Failed to update password');
          }

          set({ isLoading: false });
          alert('Password updated successfully!');
        } catch (error: any) {
          console.error('Password update error:', error);
          set({ 
            error: error.message || 'Failed to update password', 
            isLoading: false 
          });
        }
      },

      logout: async () => {
        try {
          localStorage.removeItem(CURRENT_USER_KEY);
          set({ user: null, profile: null, error: null });
        } catch (error: any) {
          console.error('Logout error:', error);
          set({ error: error.message || 'Logout failed' });
        }
      },

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const storedUser = findUserByEmail(user.email);
          if (storedUser) {
            const profile: Profile = {
              id: storedUser.id,
              email: storedUser.email,
              name: storedUser.name,
              avatar_url: storedUser.avatar_url,
              created_at: storedUser.created_at,
              updated_at: storedUser.updated_at,
            };
            set({ profile });
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        profile: state.profile 
      }),
    }
  )
);

// Initialize auth state from localStorage on app start
const initializeAuth = () => {
  try {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const storedUserData = findUserByEmail(user.email);
      
      if (storedUserData) {
        const profile: Profile = {
          id: storedUserData.id,
          email: storedUserData.email,
          name: storedUserData.name,
          avatar_url: storedUserData.avatar_url,
          created_at: storedUserData.created_at,
          updated_at: storedUserData.updated_at,
        };
        
        useAuthStore.setState({ user, profile });
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};

// Initialize on module load
initializeAuth();