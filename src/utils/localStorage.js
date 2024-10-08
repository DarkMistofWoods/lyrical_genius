// localStorage.js

const SONGS_STORAGE_KEY = 'lyrical_genius_songs';
const CATEGORIES_STORAGE_KEY = 'lyrical_genius_categories';
const CATEGORY_COLORS_STORAGE_KEY = 'lyrical_genius_category_colors';
const MOOD_BOARDS_STORAGE_KEY = 'lyrical_genius_mood_boards';

export const saveSongsToLocalStorage = (songs) => {
  try {
    const songsToSave = songs.map(song => ({
      ...song,
    }));
    const serializedSongs = JSON.stringify(songsToSave);
    localStorage.setItem(SONGS_STORAGE_KEY, serializedSongs);
  } catch (error) {
    console.error('Error saving songs to localStorage:', error);
  }
};

export const loadSongsFromLocalStorage = () => {
  try {
    const serializedSongs = localStorage.getItem(SONGS_STORAGE_KEY);
    if (serializedSongs === null) {
      return [];
    }
    const songs = JSON.parse(serializedSongs);
    return songs.map(song => ({
      ...song,
    }));
  } catch (error) {
    console.error('Error loading songs from localStorage:', error);
    return [];
  }
};

export const saveCategoriesToLocalStorage = (categories) => {
  try {
    const serializedCategories = JSON.stringify(categories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, serializedCategories);
  } catch (error) {
    console.error('Error saving categories to localStorage:', error);
  }
};

export const loadCategoriesFromLocalStorage = () => {
  try {
    const serializedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (serializedCategories === null) {
      return [];
    }
    return JSON.parse(serializedCategories);
  } catch (error) {
    console.error('Error loading categories from localStorage:', error);
    return [];
  }
};

export const saveCategoryColorsToLocalStorage = (categoryColors) => {
  try {
    const serializedCategoryColors = JSON.stringify(categoryColors);
    localStorage.setItem(CATEGORY_COLORS_STORAGE_KEY, serializedCategoryColors);
  } catch (error) {
    console.error('Error saving category colors to localStorage:', error);
  }
};

export const loadCategoryColorsFromLocalStorage = () => {
  try {
    const serializedCategoryColors = localStorage.getItem(CATEGORY_COLORS_STORAGE_KEY);
    if (serializedCategoryColors === null) {
      return {};
    }
    return JSON.parse(serializedCategoryColors);
  } catch (error) {
    console.error('Error loading category colors from localStorage:', error);
    return {};
  }
};

export const saveMoodBoardsToLocalStorage = (moodBoardState) => {
  try {
    const serializedMoodBoards = JSON.stringify(moodBoardState);
    localStorage.setItem(MOOD_BOARDS_STORAGE_KEY, serializedMoodBoards);
  } catch (error) {
    console.error('Error saving mood boards to localStorage:', error);
  }
};

export const loadMoodBoardsFromLocalStorage = () => {
  try {
    const serializedMoodBoards = localStorage.getItem(MOOD_BOARDS_STORAGE_KEY);
    if (serializedMoodBoards === null) {
      return { moodBoards: [], currentMoodBoardId: null };
    }
    return JSON.parse(serializedMoodBoards);
  } catch (error) {
    console.error('Error loading mood boards from localStorage:', error);
    return { moodBoards: [], currentMoodBoardId: null };
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(SONGS_STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    localStorage.removeItem(MOOD_BOARDS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};