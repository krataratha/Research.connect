import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
let user = null;
let profile = null;

try {
  const savedUser = localStorage.getItem('user');
  if (savedUser) user = JSON.parse(savedUser);
  const savedProfile = localStorage.getItem('profile');
  if (savedProfile) profile = JSON.parse(savedProfile);
} catch (e) {
  console.error('Error parsing stored auth data:', e);
}

const initialState = {
  user,
  profile,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
  otpEmail: localStorage.getItem('otpEmail') || null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setCredentials(state, action) {
      const { user, profile, accessToken } = action.payload;
      state.user = user;
      state.profile = profile;
      state.token = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      if (profile) {
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    },
    updateProfileState(state, action) {
      state.profile = action.payload;
      localStorage.setItem('profile', JSON.stringify(action.payload));
    },
    updateUserState(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setOtpEmail(state, action) {
      state.otpEmail = action.payload;
      if (action.payload) {
        localStorage.setItem('otpEmail', action.payload);
      } else {
        localStorage.removeItem('otpEmail');
      }
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    logoutSuccess(state) {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpEmail = null;
      state.loading = false;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('otpEmail');
    }
  }
});

export const {
  setLoading,
  setCredentials,
  updateProfileState,
  updateUserState,
  setOtpEmail,
  setError,
  logoutSuccess
} = authSlice.actions;

export default authSlice.reducer;
