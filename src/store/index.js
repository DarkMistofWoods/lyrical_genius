import { configureStore } from '@reduxjs/toolkit';
import songReducer from './songSlice';

export const store = configureStore({
  reducer: {
    song: songReducer,
  },
});