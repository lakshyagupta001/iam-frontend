import axios from 'axios';

// Create a custom axios instance
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Crucial for sending/receiving the HttpOnly refresh token cookie
});

// Interceptor to attach access token is implemented inside the AuthProvider
// to avoid circular dependencies and properly access React State/Context.
