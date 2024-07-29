import { createSlice } from '@reduxjs/toolkit';
import { saveSongsToLocalStorage } from '../utils/localStorage';

const createNewSong = () => ({
  id: Date.now(),
  title: '',
  lyrics: '',
  style: {
    vocals: [],
    genre: [],
    instruments: [],
    mood: [],
    custom: []
  }
});

const MAX_HISTORY_LENGTH = 20;

const initialState = {
  songs: [createNewSong()],
  currentSong: createNewSong(),
  history: [],
  historyIndex: -1
};

export const songSlice = createSlice({
  name: 'song',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      const currentIndex = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (currentIndex !== -1) {
        state.songs[currentIndex] = { ...state.currentSong };
      }
      
      state.currentSong = action.payload;
      state.history = [state.currentSong];
      state.historyIndex = 0;
      saveSongsToLocalStorage(state.songs);
    },
    updateLyrics: (state, action) => {
      const newSong = { ...state.currentSong, lyrics: action.payload };
      state.currentSong = newSong;
      const index = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (index !== -1) {
        state.songs[index] = newSong;
      }
      
      // Add to history
      state.history = [...state.history.slice(0, state.historyIndex + 1), newSong].slice(-MAX_HISTORY_LENGTH);
      state.historyIndex = state.history.length - 1;
      
      saveSongsToLocalStorage(state.songs);
    },
    updateTitle: (state, action) => {
      const newSong = { ...state.currentSong, title: action.payload };
      state.currentSong = newSong;
      const index = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (index !== -1) {
        state.songs[index] = newSong;
      }
      
      // Add to history
      state.history = [...state.history.slice(0, state.historyIndex + 1), newSong].slice(-MAX_HISTORY_LENGTH);
      state.historyIndex = state.history.length - 1;
      
      saveSongsToLocalStorage(state.songs);
    },
    updateStyle: (state, action) => {
      const newSong = { ...state.currentSong, style: action.payload };
      state.currentSong = newSong;
      const index = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (index !== -1) {
        state.songs[index] = newSong;
      }
      
      // Add to history
      state.history = [...state.history.slice(0, state.historyIndex + 1), newSong].slice(-MAX_HISTORY_LENGTH);
      state.historyIndex = state.history.length - 1;
      
      saveSongsToLocalStorage(state.songs);
    },
    addSong: (state) => {
      const newSong = createNewSong();
      state.songs.push(newSong);
      state.currentSong = newSong;
      state.history = [newSong];
      state.historyIndex = 0;
      saveSongsToLocalStorage(state.songs);
    },
    updateSong: (state, action) => {
      const index = state.songs.findIndex(song => song.id === action.payload.id);
      if (index !== -1) {
        state.songs[index] = action.payload;
        if (state.currentSong.id === action.payload.id) {
          state.currentSong = action.payload;
          // Add to history
          state.history = [...state.history.slice(0, state.historyIndex + 1), action.payload].slice(-MAX_HISTORY_LENGTH);
          state.historyIndex = state.history.length - 1;
        }
      }
      saveSongsToLocalStorage(state.songs);
    },
    deleteSong: (state, action) => {
      state.songs = state.songs.filter(song => song.id !== action.payload);
      if (state.songs.length === 0) {
        const newSong = createNewSong();
        state.songs.push(newSong);
        state.currentSong = newSong;
      } else if (state.currentSong.id === action.payload) {
        state.currentSong = state.songs[0];
      }
      state.history = [state.currentSong];
      state.historyIndex = 0;
      saveSongsToLocalStorage(state.songs);
    },
    loadSongs: (state, action) => {
      state.songs = action.payload.length > 0 ? action.payload : [createNewSong()];
      state.currentSong = state.songs[0];
      state.history = [state.currentSong];
      state.historyIndex = 0;
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.currentSong = state.history[state.historyIndex];
        const index = state.songs.findIndex(song => song.id === state.currentSong.id);
        if (index !== -1) {
          state.songs[index] = state.currentSong;
        }
        saveSongsToLocalStorage(state.songs);
      }
    },
  }
});

export const { 
  setCurrentSong, 
  updateLyrics, 
  updateTitle, 
  updateStyle, 
  addSong, 
  updateSong, 
  deleteSong, 
  loadSongs,
  undo
} = songSlice.actions;

export default songSlice.reducer;