import axiosInstance from './axiosConfig'

export const startIntake = () => axiosInstance.post('/api/intake/start')
export const respondToIntake = (sessionId, message, history) =>
  axiosInstance.post('/api/intake/respond', { session_id: sessionId, message, history })
export const getIntakeStatus = (userId) => axiosInstance.get(`/api/intake/status/${userId}`)
