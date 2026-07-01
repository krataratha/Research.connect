import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessions: [],
  sessionsLoading: false,
  sessionsError: null
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessionsLoading(state, action) {
      state.sessionsLoading = action.payload;
    },
    setSessionsError(state, action) {
      state.sessionsError = action.payload;
      state.sessionsLoading = false;
    },
    setSessions(state, action) {
      state.sessions = action.payload;
      state.sessionsLoading = false;
      state.sessionsError = null;
    },
    removeSession(state, action) {
      state.sessions = state.sessions.filter(s => s.sessionId !== action.payload);
    },
    clearSessionsState(state) {
      state.sessions = [];
      state.sessionsError = null;
      state.sessionsLoading = false;
    }
  }
});

export const {
  setSessionsLoading,
  setSessionsError,
  setSessions,
  removeSession,
  clearSessionsState
} = sessionSlice.actions;

export default sessionSlice.reducer;
