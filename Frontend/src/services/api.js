import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Send HTTP cookies with requests (if any)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error status is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if refresh token request itself fails with 401
      if (
        originalRequest.url.includes('/auth/refresh-token') || 
        originalRequest.url.includes('/auth/login')
      ) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const res = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        if (res.data?.success) {
          const newToken = res.data.data?.token || res.data.token;
          localStorage.setItem('token', newToken);
          
          // Update the Authorization header in the original request and retry it
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.error('Interrupted session refresh failed:', refreshErr.message);
        // Clear local token and notify AuthContext
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
