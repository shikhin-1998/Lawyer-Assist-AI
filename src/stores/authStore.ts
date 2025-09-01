import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock validation - accept any email/password for demo
        if (email && password) {
          const mockUser: User = {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: email,
            phone: '+1234567890',
          };
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } else {
          set({
            isLoading: false,
            error: 'Invalid credentials',
          });
          return false;
        }
      },
      
      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: '1',
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
        };
        
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      },
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        error: null,
      }),
      
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
