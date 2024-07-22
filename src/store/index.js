import { configureStore } from '@reduxjs/toolkit';
import songReducer from './songSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    song: songReducer,
    theme: themeReducer,
  },
});