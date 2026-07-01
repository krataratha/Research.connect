import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import themeReducer from './slices/themeSlice';
import notificationReducer from './slices/notificationSlice';
import loadingReducer from './slices/loadingSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import sessionReducer from './slices/sessionSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    theme: themeReducer,
    notification: notificationReducer,
    loading: loadingReducer,
    auth: authReducer,
    user: userReducer,
    session: sessionReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
