import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profileLoading: false,
  profileError: null,
  activeProfile: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfileLoading(state, action) {
      state.profileLoading = action.payload;
    },
    setProfileError(state, action) {
      state.profileError = action.payload;
      state.profileLoading = false;
    },
    setActiveProfile(state, action) {
      state.activeProfile = action.payload;
      state.profileLoading = false;
      state.profileError = null;
    },
    clearActiveProfile(state) {
      state.activeProfile = null;
      state.profileError = null;
      state.profileLoading = false;
    }
  }
});

export const {
  setProfileLoading,
  setProfileError,
  setActiveProfile,
  clearActiveProfile
} = userSlice.actions;

export default userSlice.reducer;
