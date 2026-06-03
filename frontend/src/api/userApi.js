import axiosInstance from './axiosConfig'

export const registerUser = (data) => axiosInstance.post('/api/users/register', data)
export const getCurrentUser = () => axiosInstance.get('/api/users/me')
export const getAllUsers = () => axiosInstance.get('/api/users/admin/all')
