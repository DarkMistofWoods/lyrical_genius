import { createSlice } from '@reduxjs/toolkit';

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
  },
  versions: [{
    timestamp: Date.now(),
    lyrics: '',
    style: {
      vocals: [],
      genre: [],
      instruments: [],
      mood: [],
      custom: []
    }
  }]
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
      state.currentSong = action.payload;
      if (!state.currentSong.versions) {
        state.currentSong.versions = [{
          timestamp: Date.now(),
          lyrics: state.currentSong.lyrics,
          style: { ...state.currentSong.style }
        }];
      }
    },
    updateLyrics: (state, action) => {
      state.currentSong.lyrics = action.payload;
    },
    updateTitle: (state, action) => {
      state.currentSong.title = action.payload;
    },
    updateStyle: (state, action) => {
      state.currentSong.style = action.payload;
    },
    addSong: (state) => {
      const newSong = createNewSong();
      state.songs.push(newSong);
      state.currentSong = newSong;
    },
    updateSong: (state, action) => {
      const index = state.songs.findIndex(song => song.id === action.payload.id);
      if (index !== -1) {
        state.songs[index] = action.payload;
        if (state.currentSong.id === action.payload.id) {
          state.currentSong = action.payload;
        }
      }
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
    },
    loadSongs: (state, action) => {
      state.songs = action.payload.length > 0 ? action.payload.map(song => ({
        ...song,
        versions: song.versions || [{
          timestamp: Date.now(),
          lyrics: song.lyrics,
          style: { ...song.style }
        }]
      })) : [createNewSong()];
      state.currentSong = state.songs[0];
    },
    saveVersion: (state) => {
      if (!state.currentSong.versions) {
        state.currentSong.versions = [];
      }
      const newVersion = {
        timestamp: Date.now(),
        lyrics: state.currentSong.lyrics,
        style: { ...state.currentSong.style }
      };
      state.currentSong.versions.push(newVersion);
    },
    restoreVersion: (state, action) => {
      const versionIndex = action.payload;
      if (state.currentSong.versions && state.currentSong.versions[versionIndex]) {
        const version = state.currentSong.versions[versionIndex];
        state.currentSong.lyrics = version.lyrics;
        state.currentSong.style = { ...version.style };
      }
    }
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
  saveVersion,
  restoreVersion
} = songSlice.actions;

export default songSlice.reducer;