import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  referralCode: string;
  isAdmin: boolean;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    referralCode: 'REF-JD2024',
    isAdmin: false,
  },
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
