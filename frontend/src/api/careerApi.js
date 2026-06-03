import axiosInstance from './axiosConfig'

export const matchCareers = (profile) => axiosInstance.post('/api/careers/match', { profile })
export const getUserCareers = (userId) => axiosInstance.get(`/api/careers/${userId}`)
export const generateRoadmap = (profileId, careerMatchId) =>
  axiosInstance.post('/api/roadmap/generate', { profile_id: profileId, career_match_id: careerMatchId })
export const getUserRoadmap = (userId) => axiosInstance.get(`/api/roadmap/${userId}`)
export const analyseGaps = (profileId, careerMatchId) =>
  axiosInstance.post(`/api/gaps/analyse?profile_id=${profileId}&career_match_id=${careerMatchId}`)
export const submitFeedback = (roadmapId, completed, mood, blockers) =>
  axiosInstance.post('/api/feedback/checkin', {
    roadmap_id: roadmapId, completed_actions: completed, mood_score: mood, blockers
  })
export const getFeedbackHistory = (roadmapId) =>
  axiosInstance.get(`/api/feedback/${roadmapId}/history`)
