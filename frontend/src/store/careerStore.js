import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCareerStore = create(persist((set) => ({
  matches: [],
  selectedMatch: null,
  roadmap: null,
  gapAnalysis: null,
  isLoadingMatches: false,
  isLoadingRoadmap: false,
  isLoadingGaps: false,
  setMatches: (matches) => set({ matches }),
  selectMatch: (match) => set({ selectedMatch: match }),
  setRoadmap: (roadmap) => set({ roadmap }),
  setGapAnalysis: (gapAnalysis) => set({ gapAnalysis }),
  setLoadingMatches: (l) => set({ isLoadingMatches: l }),
  setLoadingRoadmap: (l) => set({ isLoadingRoadmap: l }),
  setLoadingGaps: (l) => set({ isLoadingGaps: l }),
  updateRoadmapProgress: (phase, actions) => set((state) => ({
    roadmap: { ...state.roadmap, current_phase: phase, completed_actions: actions }
  })),
  reset: () => set({
    matches: [],
    selectedMatch: null,
    roadmap: null,
    gapAnalysis: null,
    isLoadingMatches: false,
    isLoadingRoadmap: false,
    isLoadingGaps: false,
  }),
}), { name: 'career-storage' }))
