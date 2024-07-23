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

const initialState = {
  songs: [createNewSong()],
  currentSong: createNewSong()
};

export const songSlice = createSlice({
  name: 'song',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      // Save the current song before switching
      const currentIndex = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (currentIndex !== -1) {
        state.songs[currentIndex] = { ...state.currentSong };
      }
      
      state.currentSong = action.payload;
      saveSongsToLocalStorage(state.songs);
    },
    updateLyrics: (state, action) => {
      state.currentSong.lyrics = action.payload;
      const index = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (index !== -1) {
        state.songs[index] = { ...state.currentSong };
      }
      saveSongsToLocalStorage(state.songs);
    },
    updateTitle: (state, action) => {
      state.currentSong.title = action.payload;
      const index = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (index !== -1) {
        state.songs[index] = { ...state.currentSong };
      }
      saveSongsToLocalStorage(state.songs);
    },
    updateStyle: (state, action) => {
      state.currentSong.style = action.payload;
      const index = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (index !== -1) {
        state.songs[index] = { ...state.currentSong };
      }
      saveSongsToLocalStorage(state.songs);
    },
    addSong: (state) => {
      const newSong = createNewSong();
      state.songs.push(newSong);
      state.currentSong = newSong;
      saveSongsToLocalStorage(state.songs);
    },
    updateSong: (state, action) => {
      const index = state.songs.findIndex(song => song.id === action.payload.id);
      if (index !== -1) {
        state.songs[index] = action.payload;
        if (state.currentSong.id === action.payload.id) {
          state.currentSong = action.payload;
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
      saveSongsToLocalStorage(state.songs);
    },
    loadSongs: (state, action) => {
      state.songs = action.payload.length > 0 ? action.payload : [createNewSong()];
      state.currentSong = state.songs[0];
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
  loadSongs
} = songSlice.actions;

export default songSlice.reducer;