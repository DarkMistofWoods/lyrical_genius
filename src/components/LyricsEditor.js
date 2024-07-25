import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import theme from '../theme';
import {
  updateLyrics,
  updateTitle,
  updateSong
} from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';
import LivePreview from './LivePreview';
import Section from './Section';
import MetadataSection from './MetadataSection';
import AddSectionButton from './AddSectionButton';
import { ChevronUp, ChevronDown } from 'lucide-react';

const sectionTypes = ['Verse', 'Chorus', 'Bridge', 'Pre-Hook', 'Line', 'Dialog', 'Pre-Chorus'];
const structureModifiers = ['Intro', 'Outro', 'Hook', 'Interlude', 'Instrumental', 'Break', 'End', 'Drop'];

function LyricsEditor() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong, songs } = useSelector(state => state.song);
  const [sections, setSections] = useState([]);
  const [addingSectionAt, setAddingSectionAt] = useState(null);
  const [editingSectionAt, setEditingSectionAt] = useState(null);
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

  const duplicateSection = (index) => {
    const newSections = [...sections];
    const duplicatedSection = { ...newSections[index] };
    newSections.splice(index + 1, 0, duplicatedSection);
    updateSections(newSections);
  };

  const changeSectionType = (index, newType) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], type: newType };
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

  const saveChanges = (updatedSong) => {
    dispatch(updateSong(updatedSong));
    const updatedSongs = songs.map(song =>
      song.id === updatedSong.id ? updatedSong : song
    );
    saveSongsToLocalStorage(updatedSongs);
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
          className={`w-full p-2 text-sm border rounded ${isDarkMode
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
        className={`transition-all duration-300 ease-in-out overflow-visible rounded-lg`}
        style={{
          maxHeight: isMetadataCollapsed ? '0' : '1000px',
          opacity: isMetadataCollapsed ? 0 : 1,
          marginTop: isMetadataCollapsed ? '1rem' : '0',
        }}
      >
        <MetadataSection currentSong={currentSong} saveChanges={saveChanges} />
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
      <div className={`px-4 pt-4 pb-20 transition-all duration-300 ease-in-out ${isMetadataCollapsed ? 'mt-12' : 'mt-4'
        }`}>
        {sections.length === 0 && (
          <div className="h-8 relative">
            <AddSectionButton
              index={0}
              isAdding={addingSectionAt === 0}
              setAddingSectionAt={setAddingSectionAt}
              addSection={addSection}
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
                />
              </div>
            )}
            <Section
              section={section}
              index={index}
              editingSectionAt={editingSectionAt}
              setEditingSectionAt={setEditingSectionAt}
              duplicateSection={duplicateSection}
              changeVerseNumber={changeVerseNumber}
              removeSection={removeSection}
              moveSection={moveSection}
              handleSectionChange={handleSectionChange}
              sectionsLength={sections.length}
              changeSectionType={changeSectionType}
            />
            <div className="h-8 relative mb-2">
              <AddSectionButton
                index={index + 1}
                isAdding={addingSectionAt === index + 1}
                setAddingSectionAt={setAddingSectionAt}
                addSection={addSection}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default LyricsEditor;