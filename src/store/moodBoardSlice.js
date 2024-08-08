import { createSlice } from '@reduxjs/toolkit';
import { saveMoodBoardsToLocalStorage, loadMoodBoardsFromLocalStorage } from '../utils/localStorage';

const defaultBackground = {
  type: 'none',
  color: '#ffffff',
  gradient: {
    color1: '#ffffff',
    color2: '#000000',
    angle: 45
  }
};

const createDefaultMoodBoard = () => ({
  id: Date.now(),
  name: 'Untitled Mood Board',
  elements: [],
  background: { ...defaultBackground },
  opacity: 0.1,
});

const validateMoodBoard = (moodBoard) => {
  return {
    ...createDefaultMoodBoard(),
    ...moodBoard,
    background: {
      ...defaultBackground,
      ...(moodBoard.background || {}),
      gradient: {
        ...defaultBackground.gradient,
        ...(moodBoard.background?.gradient || {})
      }
    }
  };
};

const initialState = (() => {
  const loadedState = loadMoodBoardsFromLocalStorage();
  if (loadedState.moodBoards.length === 0) {
    const defaultBoard = createDefaultMoodBoard();
    return {
      moodBoards: [defaultBoard],
      currentMoodBoardId: defaultBoard.id,
    };
  }
  return {
    ...loadedState,
    moodBoards: loadedState.moodBoards.map(validateMoodBoard)
  };
})();

export const moodBoardSlice = createSlice({
  name: 'moodBoard',
  initialState,
  reducers: {
    addMoodBoard: (state, action) => {
      const newMoodBoard = {
        id: Date.now(),
        name: action.payload,
        elements: [],
      };
      state.moodBoards.push(newMoodBoard);
      if (!state.currentMoodBoardId) {
        state.currentMoodBoardId = newMoodBoard.id;
      }
      saveMoodBoardsToLocalStorage(state);
    },
    removeMoodBoard: (state, action) => {
      state.moodBoards = state.moodBoards.filter(board => board.id !== action.payload);
      if (state.currentMoodBoardId === action.payload) {
        state.currentMoodBoardId = state.moodBoards[0]?.id || null;
      }
      saveMoodBoardsToLocalStorage(state);
    },
    renameMoodBoard: (state, action) => {
      const { id, newName } = action.payload;
      const moodBoard = state.moodBoards.find(board => board.id === id);
      if (moodBoard) {
        moodBoard.name = newName;
      }
      saveMoodBoardsToLocalStorage(state);
    },
    switchMoodBoard: (state, action) => {
      state.currentMoodBoardId = action.payload;
      saveMoodBoardsToLocalStorage(state);
    },
    addElement: (state, action) => {
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        const newElement = {
          id: Date.now(),
          ...action.payload,
          position: action.payload.position || { x: 0, y: 0 },
          size: action.payload.size || { width: 200, height: 200 },
        };
        currentBoard.elements.push(newElement);
      }
      saveMoodBoardsToLocalStorage(state);
    },
    removeElement: (state, action) => {
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        currentBoard.elements = currentBoard.elements.filter(element => element.id !== action.payload);
      }
      saveMoodBoardsToLocalStorage(state);
    },
    updateElementPosition: (state, action) => {
      const { id, position } = action.payload;
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        const element = currentBoard.elements.find(el => el.id === id);
        if (element) {
          element.position = position;
        }
      }
      saveMoodBoardsToLocalStorage(state);
    },
    updateElementSize: (state, action) => {
      const { id, size } = action.payload;
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        const element = currentBoard.elements.find(el => el.id === id);
        if (element) {
          element.size = size;
        }
      }
      saveMoodBoardsToLocalStorage(state);
    },
    updateElementContent: (state, action) => {
      const { id, content } = action.payload;
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        const element = currentBoard.elements.find(el => el.id === id);
        if (element) {
          element.content = content;
        }
      }
      saveMoodBoardsToLocalStorage(state);
    },

    resetToNewMoodBoard: (state) => {
      const newMoodBoard = createDefaultMoodBoard();
      state.moodBoards.push(newMoodBoard);
      state.currentMoodBoardId = newMoodBoard.id;
      saveMoodBoardsToLocalStorage(state);
    },

    resetCurrentMoodBoard: (state) => {
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        currentBoard.elements = [];
      }
      saveMoodBoardsToLocalStorage(state);
    },

    // Keep this reducer for creating a new mood board
    createNewMoodBoard: (state) => {
      const newMoodBoard = createDefaultMoodBoard();
      state.moodBoards.push(newMoodBoard);
      state.currentMoodBoardId = newMoodBoard.id;
      saveMoodBoardsToLocalStorage(state);
    },

    updateElementRotation: (state, action) => {
      const { id, rotation } = action.payload;
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        const element = currentBoard.elements.find(el => el.id === id);
        if (element) {
          element.rotation = rotation;
        }
      }
      saveMoodBoardsToLocalStorage(state);
    },

    updateBackground: (state, action) => {
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        currentBoard.background = {
          ...defaultBackground,
          ...currentBoard.background,
          ...action.payload,
          gradient: {
            ...defaultBackground.gradient,
            ...(currentBoard.background?.gradient || {}),
            ...(action.payload.gradient || {})
          }
        };
      }
      saveMoodBoardsToLocalStorage(state);
    },

    updateOpacity: (state, action) => {
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        currentBoard.opacity = action.payload;
      }
      saveMoodBoardsToLocalStorage(state);
    },

    updateGradientAngle: (state, action) => {
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard && currentBoard.background?.gradient) {
        currentBoard.background.gradient.angle = action.payload;
      }
      saveMoodBoardsToLocalStorage(state);
    },

    updateElementZIndex: (state, action) => {
      const { id } = action.payload;
      const currentBoard = state.moodBoards.find(board => board.id === state.currentMoodBoardId);
      if (currentBoard) {
        const maxZIndex = Math.max(...currentBoard.elements.map(el => el.zIndex || 0));
        const element = currentBoard.elements.find(el => el.id === id);
        if (element) {
          element.zIndex = maxZIndex + 1;
        }
      }
      saveMoodBoardsToLocalStorage(state);
    },
  },
});

export const { 
  addMoodBoard,
  removeMoodBoard,
  renameMoodBoard,
  switchMoodBoard,
  addElement, 
  removeElement, 
  updateElementPosition, 
  updateElementSize, 
  updateElementContent, 
  resetCurrentMoodBoard,
  createNewMoodBoard,
  updateElementRotation,
  updateBackground,
  updateOpacity,
  updateGradientAngle,
  updateElementZIndex,
} = moodBoardSlice.actions;

export default moodBoardSlice.reducer;