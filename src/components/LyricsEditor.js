import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { capitalizeFirstLetter } from '../utils/helpers';
import StrictModeDroppable from './StrictModeDroppable';

const sectionTypes = ['Verse', 'Chorus', 'Pre-Chorus', 'Bridge', 'Hook', 'Line', 'Dialog'];
const structureModifiers = ['Intro', 'Outro', 'Interlude', 'Instrumental', 'Break', 'End', 'Drop'];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function LyricsEditor({ isEditingMoodBoard, isFocusModeActive }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong, songs } = useSelector(state => state.song);
  const [sections, setSections] = useState([]);
  const [addingSectionAt, setAddingSectionAt] = useState(null);
  const [editingSectionAt, setEditingSectionAt] = useState(null);
  const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(false);
  const [focusedSectionIndex, setFocusedSectionIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const updateTimeoutRef = useRef(null);
  const previousSectionsRef = useRef([]);

  const saveChanges = useCallback((updatedSong) => {
    dispatch(updateSong(updatedSong));
    const updatedSongs = songs.map(song =>
      song.id === updatedSong.id ? updatedSong : song
    );
    saveSongsToLocalStorage(updatedSongs);
  }, [dispatch, songs]);

  const parseLyrics = useCallback((lyrics) => {
    const sectionRegex = /\[(.*?)\](?:\|\|\|([\s\S]*?))?(?=\n\n\[|$)/g;
    const parsedSections = [];
    let match;
  
    while ((match = sectionRegex.exec(lyrics)) !== null) {
      const [, type, content] = match;
      const parts = type.trim().split(' ');
  
      const verseIndex = parts.findIndex(part => part.toLowerCase() === 'verse');
      if (verseIndex !== -1) {
        const verseNumber = parts[verseIndex + 1] ? parseInt(parts[verseIndex + 1], 10) : 1;
        const prefix = parts.slice(0, verseIndex);
        const suffix = parts.slice(verseIndex + 2).join(' ');
        parsedSections.push({
          type: 'Verse',
          content: content || '',
          verseNumber: verseNumber,
          modifier: { prefix: prefix || [], suffix: suffix || null }
        });
      } else {
        const baseContentIndex = parts.length - 1 - [...parts].reverse().findIndex(part => 
          structureModifiers.map(m => m.toLowerCase()).includes(part.toLowerCase())
        );
        if (baseContentIndex !== -1 && baseContentIndex < parts.length) {
          const baseContent = parts[baseContentIndex];
          const prefixes = parts.slice(0, baseContentIndex);
          const suffixes = parts.slice(baseContentIndex + 1);
          parsedSections.push({
            type: 'StructureModifier',
            content: capitalizeFirstLetter(baseContent),
            modifier: { prefix: prefixes, suffix: suffixes }
          });
        } else {
          const sectionType = parts[parts.length - 1];
          const modifier = parts.slice(0, -1).join(' ');
          parsedSections.push({
            type: capitalizeFirstLetter(sectionType),
            content: content || '',
            modifier: modifier || null
          });
        }
      }
    }
    return parsedSections;
  }, [structureModifiers]);

  const updateLyricsInStore = useCallback((newSections) => {
    const formattedSections = newSections.map(section => {
      if (section.type === 'StructureModifier') {
        const baseContent = section.content;
        const prefixes = section.modifier?.prefix || [];
        const suffixes = section.modifier?.suffix || [];
        const formattedContent = [...prefixes, baseContent, ...suffixes].filter(Boolean).join(' ');
        return `[${formattedContent}]`;
      } else if (section.type === 'Verse') {
        let formattedType = `Verse ${section.verseNumber}`;
        if (section.modifier?.prefix) {
          const prefixString = Array.isArray(section.modifier.prefix) ? section.modifier.prefix.join(' ') : section.modifier.prefix;
          formattedType = `${prefixString} ${formattedType}`;
        }
        if (section.modifier?.suffix) {
          const suffixString = Array.isArray(section.modifier.suffix) ? section.modifier.suffix.join(' ') : section.modifier.suffix;
          formattedType = `${formattedType} ${suffixString}`;
        }
        return `[${formattedType}]|||${section.content}`;
      } else {
        let formattedType = section.type.toLowerCase();
        if (section.modifier) {
          const modifierString = Array.isArray(section.modifier) ? section.modifier.join(' ') : section.modifier;
          formattedType = `${modifierString} ${formattedType}`;
        }
        return `[${formattedType}]|||${section.content}`;
      }
    });
  
    const combinedLyrics = formattedSections.join('\n\n');
  
    if (JSON.stringify(newSections) !== JSON.stringify(previousSectionsRef.current)) {
      dispatch(updateLyrics(combinedLyrics));
      saveChanges({ ...currentSong, lyrics: combinedLyrics });
      previousSectionsRef.current = newSections;
    }
  }, [currentSong, dispatch, saveChanges]);

  const addSection = (category, type, index) => {
    const newSections = [...sections];
    let newSection;
  
    if (category === 'Structure Modifiers' || type === 'Custom') {
      const content = type === 'Custom' ? prompt("Enter custom modifier name:") : type;
      if (content) {
        newSection = {
          type: 'StructureModifier',
          content: content,
          modifier: null
        };
      } else {
        return;
      }
    } else if (category === 'Lyric Sections') {
      newSection = {
        type,
        content: '',
        verseNumber: type === 'Verse' ? 1 : null,
        modifier: null
      };
    }
  
    if (newSection) {
      newSections.splice(index, 0, newSection);
      updateSections(newSections);
      setAddingSectionAt(null);
    }
  };

  const duplicateSection = (index) => {
    const newSections = [...sections];
    const duplicatedSection = { ...newSections[index] };
    newSections.splice(index + 1, 0, duplicatedSection);
    updateSections(newSections);
  };

  const changeSectionType = (index, newType) => {
    const newSections = [...sections];
    newSections[index] = { 
      ...newSections[index], 
      type: newType,
      verseNumber: newType === 'Verse' ? 1 : null
    };
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
  
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      updateLyricsInStore(newSections);
    }, 300);
  };

  const navigateToSection = (direction) => {
    if (direction === 'next' && focusedSectionIndex < sections.length - 1) {
      setFocusedSectionIndex(focusedSectionIndex + 1);
    } else if (direction === 'prev' && focusedSectionIndex > 0) {
      setFocusedSectionIndex(focusedSectionIndex - 1);
    }
  };

  const addModifier = (index, modifier) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], modifier };
    updateSections(newSections);
  };

  const removeModifier = (index, updatedModifier) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], modifier: updatedModifier || null };
    updateSections(newSections);
  };

  const updateSections = useCallback((newSections) => {
    // console.log('Updating sections:', newSections);
    setSections(newSections);
    updateLyricsInStore(newSections);
  }, [updateLyricsInStore]);

  useEffect(() => {
    if (currentSong.lyrics) {
      const parsedSections = parseLyrics(currentSong.lyrics);
      // Ensure each section has a unique id
      const sectionsWithIds = parsedSections.map((section, index) => ({
        ...section,
        id: section.id || `section-${Date.now()}-${index}`
      }));
      setSections(sectionsWithIds);
      previousSectionsRef.current = sectionsWithIds;
    } else {
      setSections([]);
      previousSectionsRef.current = [];
    }
  }, [currentSong.id, currentSong.lyrics, parseLyrics]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
  
    const newSections = Array.from(sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);
  
    updateSections(newSections);
  }, [sections, updateSections]);

  const handleTitleChange = (e) => {
    dispatch(updateTitle(e.target.value));
    saveChanges({ ...currentSong, title: e.target.value });
  };

  // Reset focused section index when entering/exiting focus mode
  useEffect(() => {
    setFocusedSectionIndex(0);
  }, [isFocusModeActive]);

  const renderFocusMode = () => {
    if (sections.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No sections available. Add a section to start editing.</p>
          <button
            onClick={() => addSection('Lyric Sections', 'Verse', 0)}
            className={`mt-4 bg-[${theme.common.brown}] text-[${theme.common.white}] px-4 py-2 rounded hover:opacity-80`}
          >
            Add Verse
          </button>
        </div>
      );
    }

    return (
      <div className="relative mt-20">
        <Section
          section={sections[focusedSectionIndex]}
          index={focusedSectionIndex}
          editingSectionAt={editingSectionAt}
          setEditingSectionAt={setEditingSectionAt}
          duplicateSection={duplicateSection}
          changeVerseNumber={changeVerseNumber}
          removeSection={removeSection}
          moveSection={moveSection}
          handleSectionChange={handleSectionChange}
          sectionsLength={sections.length}
          changeSectionType={changeSectionType}
          addModifier={addModifier}
          removeModifier={removeModifier}
          isFocusMode={true}
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigateToSection('prev')}
            className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-3 py-1 rounded text-sm flex items-center ${focusedSectionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            disabled={focusedSectionIndex === 0}
          >
            <ChevronLeft size={16} className="mr-1" />
            <span className="whitespace-nowrap">Previous Section</span>
          </button>
          <button
            onClick={() => navigateToSection('next')}
            className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-3 py-1 rounded text-sm flex items-center ${focusedSectionIndex === sections.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            disabled={focusedSectionIndex === sections.length - 1}
          >
            <span className="whitespace-nowrap">Next Section</span>
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto relative">
      {!isEditingMoodBoard && !isFocusModeActive && (
        <>
          {/* Title input */}
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
        </>
      )}

      {/* Main content area */}
      <div className={`px-4 pt-4 pb-20 transition-all duration-300 ease-in-out ${
        isEditingMoodBoard ? 'mt-0' : (isMetadataCollapsed ? 'mt-12' : 'mt-4')
      }`}>
      {isFocusModeActive ? (
        renderFocusMode()
      ) : (
            <DragDropContext
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(result) => {
                setIsDragging(false);
                if (!result.destination) return;
                const newSections = Array.from(sections);
                const [reorderedSection] = newSections.splice(result.source.index, 1);
                newSections.splice(result.destination.index, 0, reorderedSection);
                updateSections(newSections);
              }}
            >
              <StrictModeDroppable droppableId="lyrics">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {sections.length === 0 && (
                      <div className="h-8 relative mb-4">
                        <AddSectionButton
                          index={0}
                          isAdding={addingSectionAt === 0}
                          setAddingSectionAt={setAddingSectionAt}
                          addSection={addSection}
                        />
                      </div>
                    )}
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                          <React.Fragment>
                            {/* Show 'add section' button above the first section only if not dragging */}
                            {index === 0 && !isDragging && (
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
                              handleSectionChange={handleSectionChange}
                              sectionsLength={sections.length}
                              changeSectionType={changeSectionType}
                              addModifier={addModifier}
                              removeModifier={removeModifier}
                              dragHandleProps={provided.dragHandleProps}
                            />
                            {/* Show 'add section' button below each section only if not dragging */}
                            {!isDragging && (
                              <div className="h-8 relative mb-2">
                                <AddSectionButton
                                  index={index + 1}
                                  isAdding={addingSectionAt === index + 1}
                                  setAddingSectionAt={setAddingSectionAt}
                                  addSection={addSection}
                                />
                              </div>
                            )}
                          </React.Fragment>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}

export default LyricsEditor;