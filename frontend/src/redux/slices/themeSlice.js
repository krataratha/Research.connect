import { createSlice } from '@reduxjs/toolkit';

// Force light theme and clean up dark class if present
if (typeof window !== 'undefined') {
  window.document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', 'light');
}

const initialState = {
  theme: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state) {
      state.theme = 'light';
      localStorage.setItem('theme', 'light');
      if (typeof window !== 'undefined') {
        window.document.documentElement.classList.remove('dark');
      }
    },
    toggleTheme(state) {
      state.theme = 'light';
      localStorage.setItem('theme', 'light');
      if (typeof window !== 'undefined') {
        window.document.documentElement.classList.remove('dark');
      }
    }
  }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;

