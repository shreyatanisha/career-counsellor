import { create } from 'zustand'

export const useIntakeStore = create((set) => ({
  conversationHistory: [],
  currentQuestion: 0,
  sessionId: null,
  profile: null,
  isComplete: false,
  isLoading: false,
  error: null,
  addMessage: (role, content) => set((state) => ({
    conversationHistory: [...state.conversationHistory, { role, content, timestamp: Date.now() }]
  })),
  setSessionId: (id) => set({ sessionId: id }),
  setProfile: (profile) => set({ profile, isComplete: true }),
  incrementQuestion: () => set((state) => ({ currentQuestion: state.currentQuestion + 1 })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    conversationHistory: [],
    currentQuestion: 0,
    sessionId: null,
    profile: null,
    isComplete: false,
    isLoading: false,
    error: null,
  }),
}))
