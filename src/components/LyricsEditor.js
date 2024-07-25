import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import theme from '../theme';
import {
  updateLyrics,
  updateTitle,
  updateStyle,
  updateSong
} from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';
import SearchableDropdown from './SearchableDropdown';
import DropdownPortal from './DropdownPortal';
import LivePreview from './LivePreview';
import CategorizedDropdown from './CategorizedDropdown';
import { Plus, XCircle, Settings, ArrowUp, ArrowDown, Copy, ChevronUp, ChevronDown } from 'lucide-react';

// Import style options
import vocalsOptions from '../data/vocals.json';
import genreOptions from '../data/genres.json';
import instrumentsOptions from '../data/instruments.json';
import moodsOptions from '../data/moods.json';

const sectionTypes = ['Verse', 'Chorus', 'Bridge', 'Pre-Hook', 'Line', 'Dialog', 'Pre-Chorus'];
const structureModifiers = ['Intro', 'Outro', 'Hook', 'Interlude', 'Instrumental', 'Break', 'End', 'Bass Drop', 'Beat Drop'];
const verseNumbers = [1, 2, 3, 4, 5, 6, 7];

function LyricsEditor() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong, songs } = useSelector(state => state.song);
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
  const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(false);

  const updateTimeoutRef = useRef(null);
  const previousSectionsRef = useRef([]);

  const parseLyrics = useCallback((lyrics) => {
    const sectionRegex = /\[(.*?)\](?:\|\|\|([\s\S]*?))?(?=\n\n\[|$)/g;
    const parsedSections = [];
    let match;
  
    while ((match = sectionRegex.exec(lyrics)) !== null) {
      const [, type, content] = match;
      const [sectionType, verseNumber] = type.split(' ');
      const lowercaseType = sectionType.toLowerCase();
  
      if (structureModifiers.map(m => m.toLowerCase()).includes(lowercaseType) && !content) {
        parsedSections.push({
          type: 'StructureModifier',
          content: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
        });
      } else {
        parsedSections.push({
          type: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
          content: content || '',
          verseNumber: verseNumber ? parseInt(verseNumber) : null,
          showTypeInPreview: lowercaseType !== 'line'
        });
      }
    }
  
    return parsedSections;
  }, []);

  const updateLyricsInStore = useCallback((newSections) => {
    const formattedSections = newSections.map(section => {
      if (section.type === 'StructureModifier') {
        return `[${section.content.toLowerCase()}]`;
      }
      let formattedType = section.type.toLowerCase();
      if (formattedType === 'verse' && section.verseNumber) {
        formattedType = `verse ${section.verseNumber}`;
      }
      return `[${formattedType}]|||${section.content}`;
    });
  
    const combinedLyrics = formattedSections.join('\n\n');
    
    if (JSON.stringify(newSections) !== JSON.stringify(previousSectionsRef.current)) {
      dispatch(updateLyrics(combinedLyrics));
      saveChanges({ ...currentSong, lyrics: combinedLyrics });
      previousSectionsRef.current = newSections;
    }
  }, [currentSong, dispatch]);

  const addSection = (category, type, index) => {
    const newSections = [...sections];
    let newSection;
  
    if (category === 'Lyric Sections') {
      newSection = {
        type,
        content: '',
        verseNumber: type === 'Verse' ? 1 : null,
      };
    } else if (category === 'Structure Modifiers') {
      newSection = {
        type: 'StructureModifier',
        content: type,
      };
    }
  
    newSections.splice(index, 0, newSection);
    updateSections(newSections);
    setAddingSectionAt(null);
  };

  const renderSection = (section, index) => {
    if (section.type === 'StructureModifier') {
      return (
        <div className={`p-2 rounded bg-[${theme.common.brown}] text-[${theme.common.white}] flex justify-between items-center w-full mb-4 relative z-10`}>
          <span>{section.content}</span>
          <div className="flex">
            <button
              onClick={() => moveSection(index, 'up')}
              className={`text-[#F2F2F2] hover:text-[#0D0C0C] mr-2 ${index === 0 ? 'opacity-50' : ''}`}
              style={{ pointerEvents: 'auto' }}
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => moveSection(index, 'down')}
              className={`text-[#F2F2F2] hover:text-[#0D0C0C] mr-2 ${index === sections.length - 1 ? 'opacity-50' : ''}`}
              style={{ pointerEvents: 'auto' }}
            >
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => removeSection(index)}
              className="text-[#F2F2F2] hover:text-[#0D0C0C]"
              style={{ pointerEvents: 'auto' }}
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 flex items-start relative">
        <div className="flex-grow relative">
          <div className="flex items-center mb-1">
            <span className="font-bold text-sm mr-2">{section.type}</span>
            <button
              onClick={() => setEditingSectionAt(editingSectionAt === index ? null : index)}
              className="text-[#A68477] hover:text-[#595859] mr-2"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={() => duplicateSection(index)}
              className="text-[#A68477] hover:text-[#595859] mr-2"
            >
              <Copy size={16} />
            </button>
            {section.type === 'Verse' && (
              <div className="flex items-center">
                {verseNumbers.map(num => (
                  <button
                    key={num}
                    onClick={() => changeVerseNumber(index, num)}
                    className={`w-6 h-6 flex items-center justify-center rounded-full mr-1 ${
                      section.verseNumber === num
                        ? 'bg-[#A68477] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
          <textarea
            placeholder={`Enter your ${section.type.toLowerCase()} lyrics here...`}
            className={`w-full p-2 border rounded ${
              isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'
            }`}
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
        <div className="ml-2 flex flex-col justify-center h-full">
          <button
            onClick={() => removeSection(index)}
            className="text-[#A68477] hover:text-[#595859] mb-2"
          >
            <XCircle size={20} />
          </button>
          <button
            onClick={() => moveSection(index, 'up')}
            className="text-[#A68477] hover:text-[#595859] mb-2"
            disabled={index === 0}
          >
            <ArrowUp size={20} />
          </button>
          <button
            onClick={() => moveSection(index, 'down')}
            className="text-[#A68477] hover:text-[#595859]"
            disabled={index === sections.length - 1}
          >
            <ArrowDown size={20} />
          </button>
        </div>
      </div>
    );
  };

  const duplicateSection = (index) => {
    const newSections = [...sections];
    const duplicatedSection = { ...newSections[index] };
    newSections.splice(index + 1, 0, duplicatedSection);
    updateSections(newSections);
  };

  const changeVerseNumber = (index, number) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], verseNumber: number };
    updateSections(newSections);
  };

  const removeSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    updateSections(newSections);
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      updateSections(newSections);
    }
  };

  const changeSectionType = (index, newType) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], type: newType };
    updateSections(newSections);
    setEditingSectionAt(null);
  };

  const handleSectionChange = (index, content) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], content };
    setSections(newSections);
    
    // Debounce the update to the store
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      updateLyricsInStore(newSections);
    }, 300);
  };

  const updateSections = useCallback((newSections) => {
    setSections(newSections);
    updateLyricsInStore(newSections);
  }, [updateLyricsInStore]);

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

  const handleCopyLyrics = (formattedLyrics) => {
    navigator.clipboard.writeText(formattedLyrics)
      .then(() => alert('Lyrics copied to clipboard!'))
      .catch(err => console.error('Failed to copy lyrics: ', err));
  };

  const AddSectionButton = ({ index, isAdding, setAddingSectionAt, addSection, isDarkMode }) => {
    const buttonRef = React.useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
      if (isAdding) {
        const timer = setTimeout(() => setShowDropdown(true), 50);
        return () => clearTimeout(timer);
      } else {
        setShowDropdown(false);
      }
    }, [isAdding]);

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setAddingSectionAt(isAdding ? null : index)}
          className={`absolute z-10 transform -translate-x-1/2 bg-[${theme.common.brown}] rounded-full p-1 hover:opacity-80`}
          style={{ top: '-10px', left: '50%', boxShadow: `0 0 0 4px ${isDarkMode ? theme.dark.background : theme.light.background}` }}
        >
          <Plus size={16} className={`text-[${theme.common.white}]`} />
        </button>
        {showDropdown && (
          <DropdownPortal
            isOpen={isAdding}
            buttonRef={buttonRef}
            onClose={() => setAddingSectionAt(null)}
          >
            <CategorizedDropdown
              onSelect={(category, item) => addSection(category, item, index)}
              isDarkMode={isDarkMode}
            />
          </DropdownPortal>
        )}
      </div>
    );
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

  useEffect(() => {
    if (currentSong.lyrics) {
      const parsedSections = parseLyrics(currentSong.lyrics);
      setSections(parsedSections);
      previousSectionsRef.current = parsedSections;
    } else {
      setSections([]);
      previousSectionsRef.current = [];
    }
  }, [currentSong.id, currentSong.lyrics, parseLyrics]);

  return (
    <div className="flex-1 overflow-auto relative">
      {/* Fixed header for title input */}
      <div className={`sticky top-16 z-40 bg-[${theme.common.grey}] p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out`}>
        <input
          type="text"
          placeholder="Song Title"
          className={`w-full p-2 text-sm border rounded ${
            isDarkMode
              ? `bg-[${theme.dark.input}] text-[${theme.common.white}] border-[${theme.common.grey}]`
              : `bg-[${theme.light.input}] text-[${theme.common.black}] border-[${theme.common.grey}]`
          }`}
          value={currentSong.title}
          onChange={handleTitleChange}
          maxLength={100}
        />
      </div>
  
      {/* Gap between sections */}
      <div className="h-16"></div>
  
      {/* Collapsible metadata section */}
      <div
        className={`bg-[${theme.common.grey}] transition-all duration-300 ease-in-out overflow-visible rounded-lg`}
        style={{
          maxHeight: isMetadataCollapsed ? '0' : '1000px',
          opacity: isMetadataCollapsed ? 0 : 1,
          marginTop: isMetadataCollapsed ? '1rem' : '0', // Pull up slightly when collapsed
        }}
      >
        <div className="p-4">
          {/* Style options */}
          <div className="flex flex-wrap items-center gap-2 mb-2 w-full">
            {Object.entries(styleOptions).map(([key, options]) => (
              <div key={key} className="flex-grow min-w-[120px] max-w-[200px]">
                <SearchableDropdown
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  options={options}
                  selectedValues={currentSong.style[key] || []}
                  onChange={(selectedValues) => handleStyleChange(key, selectedValues)}
                  labelColor={theme.common.white}
                />
              </div>
            ))}
          </div>
  
          {/* Custom style input */}
          <div className="flex mb-2 w-full">
            <input
              type="text"
              placeholder="Custom style"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              className={`flex-grow p-1 text-sm border rounded-l border-[#403E3F] ${
                isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2]' : 'bg-[#F2F2F2] text-[#0D0C0C]'
              }`}
            />
            <button
              onClick={addCustomStyle}
              className="bg-[#A68477] text-[#F2F2F2] p-2 text-sm rounded-r hover:opacity-80"
            >
              Add
            </button>
          </div>
  
          {/* Display selected styles */}
          <div className="flex flex-wrap gap-1 justify-center">
            {Object.entries(safeStyle).flatMap(([category, values]) =>
              values.map(value => (
                <span
                  key={`${category}-${value}`}
                  className={`px-2 py-0.5 text-xs rounded flex items-center bg-[#403E3F] text-[${theme.common.white}]`}
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
  
      {/* Chevron button for collapsing/expanding */}
      <button
        onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)}
        className={`sticky z-50 left-1/2 transform -translate-x-1/2 -mt-3 bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-full shadow-lg transition-all duration-300 ease-in-out`}
        style={{ top: 'auto' }}
      >
        {isMetadataCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>
  
      {/* Main content area */}
      <div className={`px-4 pt-4 pb-20 transition-all duration-300 ease-in-out ${
        isMetadataCollapsed ? 'mt-12' : 'mt-4'
      }`}>
        {sections.length === 0 && (
          <div className="h-8 relative">
            <AddSectionButton
              index={0}
              isAdding={addingSectionAt === 0}
              setAddingSectionAt={setAddingSectionAt}
              addSection={addSection}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {sections.map((section, index) => (
          <React.Fragment key={index}>
            {index === 0 && (
              <div className="h-8 relative mb-2">
                <AddSectionButton
                  index={0}
                  isAdding={addingSectionAt === 0}
                  setAddingSectionAt={setAddingSectionAt}
                  addSection={addSection}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
            {renderSection(section, index)}
            <div className="h-8 relative mb-2">
              <AddSectionButton
                index={index + 1}
                isAdding={addingSectionAt === index + 1}
                setAddingSectionAt={setAddingSectionAt}
                addSection={addSection}
                isDarkMode={isDarkMode}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default LyricsEditor;