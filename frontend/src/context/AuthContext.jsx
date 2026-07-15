import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

// Request interceptor to automatically add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Unique device identifier extraction/generation
  const getDeviceDetails = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      // Generate a unique client device ID
      deviceId = window.crypto && window.crypto.randomUUID 
        ? window.crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', deviceId);
    }
    
    // Auto-detect browser/OS names for basic device representation
    const ua = navigator.userAgent;
    let browser = 'Browser';
    let os = 'OS';
    
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    const deviceName = `${browser} on ${os}`;
    return { deviceId, deviceName };
  };

const processUserData = (profileData) => {
  if (!profileData) return null;
  const userModelFields = profileData.user && typeof profileData.user === 'object' ? profileData.user : {};
  const actualUserId = userModelFields._id || userModelFields.id || profileData.user;
  
  return {
    ...userModelFields,
    ...profileData,
    _id: actualUserId, // Force _id to be the User ID
    profileId: profileData._id, // Save profile's _id
    id: actualUserId,
    userId: actualUserId, // Explicitly add userId
    displayName: profileData.displayName || userModelFields.fullName || '',
  };
};

const fetchUserProfile = async (userObj) => {
  try {
    const profileResponse = await api.get('/profile/me');
    const profileData = profileResponse.data?.data?.profile;
    if (profileData) {
      setUser(processUserData(profileData));
    } else {
      setUser(userObj);
    }
  } catch (profileErr) {
    // Profile may not be created yet, use raw user object
    setUser(userObj);
  }
};

  const checkAuth = async () => {
    let token = localStorage.getItem('token');
    
    // 1. If token is present, try to verify it
    if (token) {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.success) {
          const userObj = response.data.data.user;
          await fetchUserProfile(userObj);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log('Access token verification failed, attempting refresh...', err.message);
      }
    }

    // 2. Token is missing or invalid. Try to restore session using refresh token cookie.
    try {
      const refreshResponse = await api.post('/auth/refresh-token');
      if (refreshResponse.data?.success) {
        const newToken = refreshResponse.data.data?.token || refreshResponse.data.token;
        const userObj = refreshResponse.data.data.user;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('accessToken', newToken); // legacy compatibility
        await fetchUserProfile(userObj);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    } catch (refreshErr) {
      console.log('Startup session restore failed:', refreshErr.message);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run checkAuth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen to session expired event
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      navigate('/login');
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, [navigate]);

  // Real Register
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  // Real Verify Email OTP
  const verifyEmail = async (email, otp) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  };

  // Real Login (Credentials Step)
  const login = async (email, password) => {
    const { deviceId, deviceName } = getDeviceDetails();
    const response = await api.post('/auth/login', { email, password, deviceId, deviceName });
    
    // If the device was already trusted and we logged in successfully without OTP
    const responseToken = response.data?.data?.token || response.data?.token;
    if (response.data?.success && !response.data?.otpRequired && responseToken) {
      const userObj = response.data.data.user;
      const token = responseToken;
      
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token); // compatibility
      await fetchUserProfile(userObj);
    }
    
    return response.data;
  };

  // Real Verify Login OTP (Second Factor Step)
  const verifyLoginOtp = async (email, otp, trustDevice = false) => {
    const { deviceId, deviceName } = getDeviceDetails();
    const response = await api.post('/auth/verify-login-otp', { 
      email, 
      otp, 
      deviceId, 
      deviceName, 
      trustDevice 
    });
    
    if (response.data?.success) {
      const userObj = response.data.data.user;
      const token = response.data.data?.token || response.data.token;
      
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token); // compatibility
      await fetchUserProfile(userObj);
      
      return { success: true, user: userObj };
    }
    return { success: false, message: response.data?.message || 'Verification failed.' };
  };

  // Real Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed:', err.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/login');
    }
  };

 
// Sync profile data
const syncProfile = async () => {
  try {
    const response = await api.get('/profile/me');
    const profileData = response.data?.data?.profile;
    if (profileData) {
      setUser(processUserData(profileData));
    } else {
      throw new Error('No profile data');
    }
  } catch (err) {
    console.error('Profile sync failed:', err.message);
    // Fallback: fetch raw user
    try {
      const userResponse = await api.get('/auth/me');
      if (userResponse.data?.success) {
        setUser(userResponse.data.data.user);
      }
    } catch (userErr) {
      console.error('User sync fallback failed:', userErr.message);
    }
  }
};


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyLoginOtp,
        register,
        verifyEmail,
        logout,
        syncProfile,
        setUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
