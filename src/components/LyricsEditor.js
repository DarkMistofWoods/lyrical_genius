import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLyrics, updateTitle, updateStyle, updateSong } from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';
import SearchableDropdown from './SearchableDropdown';

function LyricsEditor() {
  const dispatch = useDispatch();
  const { currentSong, songs } = useSelector(state => state.song);
  const [styleOptions, setStyleOptions] = useState({
    vocals: [],
    genre: [],
    instruments: [],
    mood: []
  });
  const [customStyle, setCustomStyle] = useState('');

  useEffect(() => {
    const loadStyleOptions = async () => {
      const vocals = await import('../data/vocals.json');
      const genres = await import('../data/genres.json');
      const instruments = await import('../data/instruments.json');
      const moods = await import('../data/moods.json');

      setStyleOptions({
        vocals: vocals.default,
        genre: genres.default,
        instruments: instruments.default,
        mood: moods.default
      });
    };

    loadStyleOptions();
  }, []);

  const handleLyricsChange = (e) => {
    dispatch(updateLyrics(e.target.value));
    saveChanges({ ...currentSong, lyrics: e.target.value });
  };

  const handleTitleChange = (e) => {
    dispatch(updateTitle(e.target.value));
    saveChanges({ ...currentSong, title: e.target.value });
  };

  const handleStyleChange = (category, selectedValues) => {
    const newStyle = { ...currentSong.style, [category]: selectedValues };
    dispatch(updateStyle(newStyle));
    saveChanges({ ...currentSong, style: newStyle });
  };

  const handleCustomStyleChange = (e) => {
    setCustomStyle(e.target.value);
  };

  const addCustomStyle = () => {
    if (customStyle.trim()) {
      const newStyle = { 
        ...currentSong.style, 
        custom: [...(currentSong.style.custom || []), customStyle.trim()]
      };
      dispatch(updateStyle(newStyle));
      saveChanges({ ...currentSong, style: newStyle });
      setCustomStyle('');
    }
  };

  const removeStyle = (category, value) => {
    const newStyle = { 
      ...currentSong.style, 
      [category]: currentSong.style[category].filter(v => v !== value)
    };
    dispatch(updateStyle(newStyle));
    saveChanges({ ...currentSong, style: newStyle });
  };

  const saveChanges = (updatedSong) => {
    dispatch(updateSong(updatedSong));
    const updatedSongs = songs.map(song => 
      song.id === updatedSong.id ? updatedSong : song
    );
    saveSongsToLocalStorage(updatedSongs);
  };

  // Ensure all style properties are arrays
  const safeStyle = {
    vocals: [],
    genre: [],
    instruments: [],
    mood: [],
    custom: [],
    ...currentSong.style
  };

  return (
    <div className="flex-1 p-4">
      <input 
        type="text" 
        placeholder="Song Title" 
        className="w-full mb-4 p-2 border rounded"
        value={currentSong.title}
        onChange={handleTitleChange}
      />
      <textarea 
        placeholder="Enter your lyrics here..."
        className="w-full h-64 p-2 border rounded mb-4"
        value={currentSong.lyrics}
        onChange={handleLyricsChange}
      ></textarea>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.entries(styleOptions).map(([key, options]) => (
          <SearchableDropdown
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            options={options}
            selectedValues={safeStyle[key] || []}
            onChange={(selectedValues) => handleStyleChange(key, selectedValues)}
          />
        ))}
      </div>
      <div className="flex mb-4">
        <input 
          type="text" 
          placeholder="Custom style"
          value={customStyle}
          onChange={handleCustomStyleChange}
          className="flex-grow p-2 border rounded-l"
        />
        <button 
          onClick={addCustomStyle}
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(safeStyle).flatMap(([category, values]) =>
          (values || []).map(value => (
            <span 
              key={`${category}-${value}`} 
              className="bg-gray-200 px-2 py-1 rounded flex items-center"
            >
              {value}
              <button 
                onClick={() => removeStyle(category, value)}
                className="ml-2 text-red-500"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export default LyricsEditor;