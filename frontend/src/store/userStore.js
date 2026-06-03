import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(persist((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
}), { name: 'user-storage' }))
