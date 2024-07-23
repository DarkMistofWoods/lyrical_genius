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

  useEffect(() => {
    if (currentSong.lyrics) {
      const initialSections = currentSong.lyrics.split('\n\n').map(content => {
        const lines = content.split('\n');
        const type = lines[0].replace(/[\[\]]/g, '').trim();
        const sectionContent = lines.slice(1).join('\n');
        return { type, content: sectionContent };
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
    const totalLength = Object.values(newStyle)
      .flat()
      .join(', ')
      .length;
    
    if (totalLength <= 120) {
      dispatch(updateStyle(newStyle));
      saveChanges({ ...currentSong, style: newStyle });
    } else {
      alert("Total length of selected styles cannot exceed 120 characters.");
    }
  };

  const addCustomStyle = () => {
    if (customStyle.trim()) {
      const newStyle = { 
        ...currentSong.style, 
        custom: [...(currentSong.style.custom || []), customStyle.trim()]
      };
      const totalLength = Object.values(newStyle)
        .flat()
        .join(', ')
        .length;
      
      if (totalLength <= 120) {
        dispatch(updateStyle(newStyle));
        saveChanges({ ...currentSong, style: newStyle });
        setCustomStyle('');
      } else {
        alert("Adding this custom style would exceed the 120 character limit for all styles.");
      }
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
        className={`absolute z-10 transform -translate-x-1/2 bg-[#A68477] rounded-full p-1 hover:opacity-80`}
        style={{ top: '-10px', left: '50%' }}
      >
        <Plus size={16} className="text-[#F2F2F2]" />
      </button>
      {addingSectionAt === index && (
        <div className={`absolute z-50 top-0 left-1/2 transform -translate-x-1/2 ${isDarkMode ? 'bg-[#595859]' : 'bg-[#F2F2F2]'} border rounded shadow-lg`}>
          {sectionTypes.map((type) => (
            <button
              key={type}
              onClick={() => addSection(type, index)}
              className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-[#0D0C0C]' : 'bg-[#A68477]'} ${isDarkMode ? 'text-[#F2F2F2]' : 'text-[#0D0C0C]'}`}
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
    <div className={`flex-1 overflow-auto ${isDarkMode ? 'bg-[#0D0C0C] text-[#F2F2F2]' : 'bg-[#F2F2F2] text-[#0D0C0C]'}`}>
      <div className="sticky top-0 bg-inherit pt-2 pb-2 mb-6 z-40 shadow-md">
        <div className="px-4 flex flex-col items-center">
          <input 
            type="text" 
            placeholder="Song Title" 
            className={`w-1/2 mb-2 p-1 text-sm border rounded ${isDarkMode ? 'bg-[#595859] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'}`}
            value={currentSong.title}
            onChange={handleTitleChange}
          />
          <div className="text-xs text-center mb-2">
            Words: {currentSong.lyrics.split(/\s+/).filter(Boolean).length} | 
            Characters: {currentSong.lyrics.length} | 
            Lines: {currentSong.lyrics.split('\n').filter(Boolean).length}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2 w-full">
            <span className="text-sm font-semibold">Song Style:</span>
            {Object.entries(styleOptions).map(([key, options]) => (
              <div key={key} className="flex-grow min-w-[120px] max-w-[200px]">
                <SearchableDropdown
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  options={options}
                  selectedValues={currentSong.style[key] || []}
                  onChange={(selectedValues) => handleStyleChange(key, selectedValues)}
                />
              </div>
            ))}
          </div>
          
          <div className="flex mb-2 w-1/2">
            <input 
              type="text" 
              placeholder="Custom style"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              className={`flex-grow p-1 text-sm border rounded-l ${isDarkMode ? 'bg-[#595859] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'}`}
            />
            <button 
              onClick={addCustomStyle}
              className="bg-[#A68477] text-[#F2F2F2] p-1 text-sm rounded-r hover:opacity-80"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1 justify-center">
            {Object.entries(currentSong.style).flatMap(([category, values]) =>
              (values || []).map(value => (
                <span 
                  key={`${category}-${value}`} 
                  className={`px-2 py-0.5 text-xs rounded flex items-center ${isDarkMode ? 'bg-[#595859]' : 'bg-[#A68477] text-[#F2F2F2]'}`}
                >
                  {value}
                  <button 
                    onClick={() => removeStyle(category, value)}
                    className="ml-1 text-[#F2F2F2] hover:text-[#0D0C0C]"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 pt-8"> {/* Added top padding */}
        {sections.length === 0 && (
          <div className="h-8 relative">
            {renderAddSectionButton(0)}
          </div>
        )}
        
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            {index === 0 && (
              <div className="h-8 relative mb-2">
                {renderAddSectionButton(0)}
              </div>
            )}
            <div className="mb-4 flex items-start relative">
              <div className="flex-grow relative">
                <div className="flex items-center mb-1">
                  <span className="font-bold text-sm mr-2">{section.type.charAt(0).toUpperCase() + section.type.slice(1)}</span>
                  <button
                    onClick={() => setEditingSectionAt(editingSectionAt === index ? null : index)}
                    className="text-[#A68477] hover:text-[#595859]"
                  >
                    <Settings size={16} />
                  </button>
                </div>
                <textarea 
                  placeholder={`Enter your ${section.type.toLowerCase()} lyrics here...`}
                  className={`w-full p-2 border rounded ${isDarkMode ? 'bg-[#595859] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'}`}
                  value={section.content}
                  onChange={(e) => handleSectionChange(index, e.target.value)}
                  rows={6}
                ></textarea>
                {editingSectionAt === index && (
                  <div className={`absolute z-50 top-6 left-0 ${isDarkMode ? 'bg-[#595859]' : 'bg-[#F2F2F2]'} border border-[#595859] rounded shadow-lg`}>
                    {sectionTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => changeSectionType(index, type)}
                        className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-[#0D0C0C]' : 'bg-[#A68477]'} ${isDarkMode ? 'text-[#F2F2F2]' : 'text-[#0D0C0C]'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => removeSection(index)}
                className="ml-2 text-[#A68477] hover:text-[#595859]"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="h-8 relative mb-2">
              {renderAddSectionButton(index + 1)}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default LyricsEditor;