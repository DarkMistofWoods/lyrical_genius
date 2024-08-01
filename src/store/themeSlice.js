import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme === 'dark' ? true : false;
};

const initialState = {
  isDarkMode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
    },
    loadTheme: (state) => {
      state.isDarkMode = getInitialTheme();
    },
  },
});

export const { toggleTheme, loadTheme } = themeSlice.actions;

export default themeSlice.reducer;