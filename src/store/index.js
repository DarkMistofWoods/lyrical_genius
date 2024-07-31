import { configureStore } from '@reduxjs/toolkit';
import songReducer from './songSlice';
import themeReducer from './themeSlice';
import moodBoardReducer from './moodBoardSlice';

export const store = configureStore({
  reducer: {
    song: songReducer,
    theme: themeReducer,
    moodBoard: moodBoardReducer,
  },
});