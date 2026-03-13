import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 
  // Internal Team
  | "admin" 
  | "internal_ops" 
  | "internal_finance" 
  | "internal_sales"
  // Customer
  | "customer_admin" 
  | "customer_ops" 
  | "customer_finance"
  | null;

interface User {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (role) => {
        // Mock login data based on role
        const userData: User = {
          name: role?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "User",
          email: `${role}@example.com`,
          avatar: "/avatars/shadcn.jpg",
          role: role
        };
        set({ user: userData, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
