import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateLyrics, 
  updateTitle, 
  updateStyle, 
  updateSong
} from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';
import SearchableDropdown from './SearchableDropdown';
import { Plus, XCircle, Settings } from 'lucide-react';

// Import style options
import vocalsOptions from '../data/vocals.json';
import genreOptions from '../data/genres.json';
import instrumentsOptions from '../data/instruments.json';
import moodsOptions from '../data/moods.json';

const sectionTypes = ['Verse', 'Chorus', 'Bridge', 'Hook', 'Pre-Hook'];

function LyricsEditor() {
  const dispatch = useDispatch();
  const { currentSong, songs } = useSelector(state => state.song);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [sections, setSections] = useState([]);
  const [addingSectionAt, setAddingSectionAt] = useState(null);
  const [editingSectionAt, setEditingSectionAt] = useState(null);
  const [styleOptions] = useState({
    vocals: vocalsOptions,
    genre: genreOptions,
    instruments: instrumentsOptions,
    mood: moodsOptions
  });
  const [customStyle, setCustomStyle] = useState('');

  const wordCount = currentSong.lyrics.split(/\s+/).filter(Boolean).length;
  const characterCount = currentSong.lyrics.length;
  const lineCount = currentSong.lyrics.split('\n').filter(Boolean).length;

  useEffect(() => {
    if (currentSong.lyrics) {
      const initialSections = currentSong.lyrics.split('\n\n').map(content => {
        const [type, ...lines] = content.split('\n');
        return {
          type: type.replace(/[\[\]]/g, '').trim(),
          content: lines.join('\n').trim()
        };
      });
      setSections(initialSections);
    } else {
      setSections([]);
    }
  }, [currentSong.id]);

  const addSection = (type, index) => {
    const newSections = [...sections];
    newSections.splice(index, 0, { type, content: '' });
    setSections(newSections);
    updateLyricsInStore(newSections);
    setAddingSectionAt(null);
  };

  const removeSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    updateLyricsInStore(newSections);
  };

  const changeSectionType = (index, newType) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], type: newType };
    setSections(newSections);
    updateLyricsInStore(newSections);
    setEditingSectionAt(null);
  };

  const handleSectionChange = (index, content) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], content };
    setSections(newSections);
    updateLyricsInStore(newSections);
  };

  const updateLyricsInStore = (newSections) => {
    const combinedLyrics = newSections.map(section => `[${section.type}]\n${section.content}`).join('\n\n');
    dispatch(updateLyrics(combinedLyrics));
    saveChanges({ ...currentSong, lyrics: combinedLyrics });
  };

  const handleTitleChange = (e) => {
    dispatch(updateTitle(e.target.value));
    saveChanges({ ...currentSong, title: e.target.value });
  };

  const handleStyleChange = (category, selectedValues) => {
    const newStyle = { ...currentSong.style, [category]: selectedValues };
    const totalLength = Object.values(newStyle).flat().join(', ').length;
    
    if (totalLength <= 120) {
      dispatch(updateStyle(newStyle));
      saveChanges({ ...currentSong, style: newStyle });
    } else {
      alert("Total length of selected styles cannot exceed 120 characters.");
    }
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

  const handleCopyLyrics = () => {
    const formattedLyrics = `${currentSong.title}\n\n${currentSong.lyrics}\n\nStyle: ${Object.entries(currentSong.style)
      .filter(([_, values]) => values.length > 0)
      .map(([category, values]) => `${category}: ${values.join(', ')}`)
      .join(' | ')}`;
    
    navigator.clipboard.writeText(formattedLyrics)
      .then(() => alert('Lyrics copied to clipboard!'))
      .catch(err => console.error('Failed to copy lyrics: ', err));
  };

  const renderAddSectionButton = (index) => (
    <div className="relative">
      <button
        onClick={() => setAddingSectionAt(addingSectionAt === index ? null : index)}
        className={`absolute z-10 transform -translate-x-1/2 ${isDarkMode ? 'bg-dark-primary' : 'bg-light-primary'} rounded-full p-1 hover:opacity-80`}
        style={{ top: '-10px', left: '50%' }}
      >
        <Plus size={16} className="text-white" />
      </button>
      {addingSectionAt === index && (
        <div className={`absolute z-20 top-0 left-1/2 transform -translate-x-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border rounded shadow-lg`}>
          {sectionTypes.map((type) => (
            <button
              key={type}
              onClick={() => addSection(type, index)}
              className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${isDarkMode ? 'text-dark-primary' : 'text-light-primary'}`}
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );

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
    <div className={`flex-1 p-4 overflow-auto ${isDarkMode ? 'bg-dark-background text-dark-text' : 'bg-light-background text-light-text'}`}>
      <input 
        type="text" 
        placeholder="Song Title" 
        className={`w-full mb-2 p-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
        value={currentSong.title}
        onChange={handleTitleChange}
      />
      <div className="text-sm mb-4 text-center">
        Words: {wordCount} | Characters: {characterCount} | Lines: {lineCount}
      </div>
      
      {sections.length === 0 && renderAddSectionButton(0)}
      
      {sections.map((section, index) => (
        <React.Fragment key={index}>
          {index === 0 && renderAddSectionButton(0)}
          <div className="mb-4 flex items-start relative">
            <div className="flex-grow relative">
              <textarea 
                placeholder={`Enter your ${section.type.toLowerCase()} lyrics here...`}
                className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                value={section.content}
                onChange={(e) => handleSectionChange(index, e.target.value)}
                rows={6}
              ></textarea>
              <button
                onClick={() => setEditingSectionAt(editingSectionAt === index ? null : index)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <Settings size={20} />
              </button>
              {editingSectionAt === index && (
                <div className={`absolute z-20 top-8 right-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border rounded shadow-lg`}>
                  {sectionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => changeSectionType(index, type)}
                      className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${isDarkMode ? 'text-dark-primary' : 'text-light-primary'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => removeSection(index)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <XCircle size={20} />
            </button>
          </div>
          {renderAddSectionButton(index + 1)}
        </React.Fragment>
      ))}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Song Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          className={`${isDarkMode ? 'bg-dark-primary' : 'bg-light-primary'} text-white p-2 rounded-r hover:opacity-80`}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
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
      <div className="mb-6">
        <button
          onClick={handleCopyLyrics}
          className={`${isDarkMode ? 'bg-purple-500' : 'bg-purple-600'} text-white py-2 px-4 rounded hover:opacity-80`}
        >
          Copy Lyrics
        </button>
      </div>
    </div>
  );
}

export default LyricsEditor;