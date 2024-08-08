import { createSlice } from '@reduxjs/toolkit';
import { saveSongsToLocalStorage, saveCategoriesToLocalStorage, loadSongsFromLocalStorage, loadCategoriesFromLocalStorage, saveCategoryColorsToLocalStorage, loadCategoryColorsFromLocalStorage } from '../utils/localStorage';
import { getCategoryColor } from '../utils/helpers';

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
  categories: [],
  versions: []
});

const MAX_HISTORY_LENGTH = 20;
const MAX_VERSIONS = 5;

const initialState = {
  songs: loadSongsFromLocalStorage(),
  currentSong: loadSongsFromLocalStorage()[0] || createNewSong(),
  categories: loadCategoriesFromLocalStorage(),
  categoryColors: loadCategoryColorsFromLocalStorage(),
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
      // Perform two undo steps at once
      if (state.historyIndex > 1) {
        state.historyIndex -= 2;
        state.currentSong = state.history[state.historyIndex];
        const index = state.songs.findIndex(song => song.id === state.currentSong.id);
        if (index !== -1) {
          state.songs[index] = state.currentSong;
        }
        saveSongsToLocalStorage(state.songs);
      } else if (state.historyIndex === 1) {
        // If we're at the second item, just go back to the first
        state.historyIndex = 0;
        state.currentSong = state.history[0];
        const index = state.songs.findIndex(song => song.id === state.currentSong.id);
        if (index !== -1) {
          state.songs[index] = state.currentSong;
        }
        saveSongsToLocalStorage(state.songs);
      }
      // If historyIndex is 0, do nothing as we're already at the start
    },
    // New reducers for category management
    addCategory: (state, action) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
        state.categoryColors[action.payload] = getCategoryColor(action.payload, state.categoryColors);
        saveCategoriesToLocalStorage(state.categories);
        saveCategoryColorsToLocalStorage(state.categoryColors);
      }
    },

    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(category => category !== action.payload);
      delete state.categoryColors[action.payload];
      state.songs.forEach(song => {
        song.categories = song.categories.filter(category => category !== action.payload);
      });
      if (state.currentSong) {
        state.currentSong.categories = state.currentSong.categories.filter(category => category !== action.payload);
      }
      saveSongsToLocalStorage(state.songs);
      saveCategoriesToLocalStorage(state.categories);
      saveCategoryColorsToLocalStorage(state.categoryColors);
    },

    renameCategory: (state, action) => {
      const { oldName, newName } = action.payload;
      const index = state.categories.findIndex(category => category === oldName);
      if (index !== -1) {
        state.categories[index] = newName;
        state.categoryColors[newName] = state.categoryColors[oldName];
        delete state.categoryColors[oldName];
        state.songs.forEach(song => {
          const categoryIndex = song.categories.findIndex(category => category === oldName);
          if (categoryIndex !== -1) {
            song.categories[categoryIndex] = newName;
          }
        });
        if (state.currentSong) {
          const currentSongCategoryIndex = state.currentSong.categories.findIndex(category => category === oldName);
          if (currentSongCategoryIndex !== -1) {
            state.currentSong.categories[currentSongCategoryIndex] = newName;
          }
        }
        saveSongsToLocalStorage(state.songs);
        saveCategoriesToLocalStorage(state.categories);
        saveCategoryColorsToLocalStorage(state.categoryColors);
      }
    },
    assignSongToCategory: (state, action) => {
      const { songId, category } = action.payload;
      const songIndex = state.songs.findIndex(song => song.id === songId);
      if (songIndex !== -1 && !state.songs[songIndex].categories.includes(category)) {
        state.songs[songIndex].categories.push(category);
        if (state.currentSong.id === songId) {
          state.currentSong.categories.push(category);
        }
        saveSongsToLocalStorage(state.songs);
      }
    },
    unassignSongFromCategory: (state, action) => {
      const { songId, category } = action.payload;
      const songIndex = state.songs.findIndex(song => song.id === songId);
      if (songIndex !== -1) {
        state.songs[songIndex].categories = state.songs[songIndex].categories.filter(c => c !== category);
        if (state.currentSong.id === songId) {
          state.currentSong.categories = state.currentSong.categories.filter(c => c !== category);
        }
        saveSongsToLocalStorage(state.songs);
      }
    },

    saveVersion: (state, action) => {
      const { songId } = action.payload;
      const song = state.songs.find(s => s.id === songId);
      if (song) {
        const newVersion = {
          title: song.title,
          lyrics: song.lyrics,
          style: song.style,
          timestamp: Date.now()
        };
        song.versions.unshift(newVersion);
        if (song.versions.length > MAX_VERSIONS) {
          song.versions = song.versions.slice(0, MAX_VERSIONS);
        }
        if (state.currentSong.id === songId) {
          state.currentSong.versions = song.versions;
        }
        saveSongsToLocalStorage(state.songs);
      }
    },

    saveCurrentVersion: (state) => {
      const song = state.currentSong;
      const newVersion = {
        title: song.title,
        lyrics: song.lyrics,
        style: song.style,
        timestamp: Date.now()
      };
      song.versions.unshift(newVersion);
      if (song.versions.length > MAX_VERSIONS) {
        song.versions = song.versions.slice(0, MAX_VERSIONS);
      }
      const songIndex = state.songs.findIndex(s => s.id === song.id);
      if (songIndex !== -1) {
        state.songs[songIndex] = song;
      }
      saveSongsToLocalStorage(state.songs);
    },

    removeVersion: (state, action) => {
      const { songId, versionIndex } = action.payload;
      const song = state.songs.find(s => s.id === songId);
      if (song && song.versions[versionIndex]) {
        song.versions.splice(versionIndex, 1);
        if (state.currentSong.id === songId) {
          state.currentSong.versions = song.versions;
        }
        saveSongsToLocalStorage(state.songs);
      }
    },

    revertToVersion: (state, action) => {
      const { songId, versionIndex } = action.payload;
      const song = state.songs.find(s => s.id === songId);
      if (song && song.versions[versionIndex]) {
        const version = song.versions[versionIndex];
        song.title = version.title;
        song.lyrics = version.lyrics;
        song.style = version.style;
        if (state.currentSong.id === songId) {
          state.currentSong = { ...song };
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
  undo,
  addCategory,
  deleteCategory,
  renameCategory,
  assignSongToCategory,
  unassignSongFromCategory,
  saveVersion,
  saveCurrentVersion,
  removeVersion,
  revertToVersion
} = songSlice.actions;

export default songSlice.reducer;