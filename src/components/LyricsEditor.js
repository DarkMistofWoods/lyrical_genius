import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateLyrics, 
  updateTitle, 
  updateStyle, 
  updateSong, 
  saveVersion, 
  restoreVersion 
} from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';
import SearchableDropdown from './SearchableDropdown';

function LyricsEditor() {
  const dispatch = useDispatch();
  const { currentSong, songs } = useSelector(state => state.song);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
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

  const handleSaveVersion = () => {
    dispatch(saveVersion());
    saveChanges(currentSong);
  };

  const handleRestoreVersion = (index) => {
    dispatch(restoreVersion(index));
    saveChanges(currentSong);
  };

  const handleAddSection = (sectionType) => {
    const sectionText = `\n\n[${sectionType}]\n`;
    const newLyrics = currentSong.lyrics + sectionText;
    dispatch(updateLyrics(newLyrics));
    saveChanges({ ...currentSong, lyrics: newLyrics });
  };

  const handleCopyLyrics = () => {
    const formattedLyrics = `${currentSong.title}\n\n${currentSong.lyrics}\n\nStyle: ${Object.entries(currentSong.style)
      .filter(([_, values]) => values.length > 0)
      .map(([category, values]) => `${category}: ${values.join(', ')}`)
      .join(' | ')}`;
    
    navigator.clipboard.writeText(formattedLyrics)
      .then(() => alert('Lyrics copied to clipboard!'))
      .catch(err => console.error('Failed to copy lyrics: ', err));
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
    <div className={`flex-1 p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <input 
        type="text" 
        placeholder="Song Title" 
        className={`w-full mb-4 p-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
        value={currentSong.title}
        onChange={handleTitleChange}
      />
      <div className="mb-4">
        <button 
          onClick={() => handleAddSection('Verse')}
          className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2"
        >
          Add Verse
        </button>
        <button 
          onClick={() => handleAddSection('Chorus')}
          className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2"
        >
          Add Chorus
        </button>
        <button 
          onClick={() => handleAddSection('Bridge')}
          className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2"
        >
          Add Bridge
        </button>
      </div>
      <textarea 
        placeholder="Enter your lyrics here..."
        className={`w-full h-64 p-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
        value={currentSong.lyrics}
        onChange={handleLyricsChange}
      ></textarea>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {Object.entries(styleOptions).map(([key, options]) => (
          <SearchableDropdown
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            options={options}
            selectedValues={safeStyle[key] || []}
            onChange={(selectedValues) => handleStyleChange(key, selectedValues)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
      <div className="flex mb-4">
        <input 
          type="text" 
          placeholder="Custom style"
          value={customStyle}
          onChange={handleCustomStyleChange}
          className={`flex-grow p-2 border rounded-l ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
        />
        <button 
          onClick={addCustomStyle}
          className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(safeStyle).flatMap(([category, values]) =>
          (values || []).map(value => (
            <span 
              key={`${category}-${value}`} 
              className={`px-2 py-1 rounded flex items-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
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
      <div className="mb-4">
        <button
          onClick={handleSaveVersion}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mr-2"
        >
          Save Version
        </button>
        <button
          onClick={handleCopyLyrics}
          className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Copy Lyrics
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Version History</h3>
        {currentSong.versions.map((version, index) => (
          <button
            key={version.timestamp}
            onClick={() => handleRestoreVersion(index)}
            className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2 mb-2"
          >
            Restore Version {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LyricsEditor;