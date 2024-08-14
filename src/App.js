import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LyricsEditor from './components/LyricsEditor';
import LivePreview from './components/LivePreview';
import Toolbar from './components/Toolbar';
import MoodBoard from './components/MoodBoard';
import Onboarding from './components/Onboarding';
import { loadSongs } from './store/songSlice';
import { loadSongsFromLocalStorage } from './utils/localStorage';
import theme from './theme';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { saveVersion } from './store/songSlice';
import { loadTheme } from './store/themeSlice';

const TESTING = true; // Set this to false in production

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong } = useSelector(state => state.song);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [isMoodBoardVisible, setIsMoodBoardVisible] = useState(true);
  const [isEditingMoodBoard, setIsEditingMoodBoard] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);

  // New state variables for mobile layout
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSongListVisible, setIsSongListVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelpIcon, setShowHelpIcon] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding || TESTING) {
      setShowOnboarding(true);
    } else {
      setShowHelpIcon(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setShowHelpIcon(true);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleOpenOnboarding = () => {
    setShowOnboarding(true);
  };

  useEffect(() => {
    const savedSongs = loadSongsFromLocalStorage();
    dispatch(loadSongs(savedSongs));
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Assuming 768px as the breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  useEffect(() => {
    let prevSong = currentSong;
    return () => {
      if (prevSong.id !== currentSong.id) {
        const hasChanges = prevSong.lyrics !== prevSong.versions[0]?.lyrics ||
                           prevSong.title !== prevSong.versions[0]?.title ||
                           JSON.stringify(prevSong.style) !== JSON.stringify(prevSong.versions[0]?.style);
        if (hasChanges) {
          dispatch(saveVersion({
            songId: prevSong.id,
            version: {
              title: prevSong.title,
              lyrics: prevSong.lyrics,
              style: prevSong.style,
              timestamp: Date.now()
            }
          }));
        }
      }
    };
  }, [currentSong, dispatch]);

  const handleCopyLyrics = () => {
    const formattedLyrics = `${currentSong.title}\n\n${currentSong.lyrics}\n\nStyle: ${Object.values(currentSong.style).flat().filter(Boolean).join(', ')}`;
    
    navigator.clipboard.writeText(formattedLyrics)
      .then(() => alert('Lyrics copied to clipboard!'))
      .catch(err => console.error('Failed to copy lyrics: ', err));
  };

  const toggleFocusMode = () => {
    setIsFocusModeActive(!isFocusModeActive);
    if (!isFocusModeActive) {
      setIsSidebarCollapsed(true);
      setIsPreviewCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
      setIsPreviewCollapsed(false);
    }
  };

  // New toggle functions for mobile layout
  const togglePreview = () => {
    if (isMobile) {
      setIsPreviewVisible(!isPreviewVisible);
      setIsSongListVisible(false);
    } else {
      setIsPreviewCollapsed(!isPreviewCollapsed);
    }
  };

  const toggleSongList = () => {
    if (isMobile) {
      setIsSongListVisible(!isSongListVisible);
      setIsPreviewVisible(false);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className={`min-h-screen overflow-x-hidden bg-[${isDarkMode ? theme.dark.background : theme.light.background}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
      <MoodBoard isVisible={isMoodBoardVisible} isEditing={isEditingMoodBoard} />
      {!isEditingMoodBoard && (
        <Header 
          isFocusModeActive={isFocusModeActive}
          togglePreview={togglePreview}
          toggleSongList={toggleSongList}
          isMobile={isMobile}
          isPreviewVisible={isPreviewVisible}
          isSongListVisible={isSongListVisible}
          showHelpIcon={showHelpIcon}
          onOpenOnboarding={handleOpenOnboarding}
        />
      )}
      <div className={`flex flex-col md:flex-row ${isEditingMoodBoard ? 'pt-0' : 'pt-16'} pb-16`}>
        {/* Sidebar */}
        <div 
          className={`sidebar fixed left-0 ${isEditingMoodBoard ? 'top-0' : 'top-16'} bottom-16 overflow-visible transition-all duration-300
            ${isMobile ? (isSongListVisible ? 'w-full' : 'w-0') : (isSidebarCollapsed ? 'w-0' : 'w-96')}
            ${isMobile ? 'z-20' : ''}
          `}
        >
          <div className={`bg-[${theme.common.grey}] h-full rounded-r-lg relative bg-opacity-0`}>
            <div className={`overflow-y-auto h-full pt-4 transition-opacity duration-300 ${
              (isMobile ? !isSongListVisible : isSidebarCollapsed) || isFocusModeActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              <Sidebar />
            </div>
            {!isMobile && !isEditingMoodBoard && !isFocusModeActive && (
              <button
                onClick={toggleSongList}
                className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-full ${isSidebarCollapsed ? '-right-6' : 'right-0 translate-x-full'}`}
              >
                {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        {!isEditingMoodBoard && (!isMobile || (!isPreviewVisible && !isSongListVisible)) && (
          <main className={`lyrics-editor flex-1 transition-all duration-300 ease-in-out
            ${isMobile ? 'ml-0 mr-0' : `
              ${isSidebarCollapsed ? 'ml-0' : 'ml-96'}
              ${isPreviewCollapsed ? 'mr-0' : 'mr-96'}
            `}
          `}>
            <div className="max-w-3xl mx-auto px-4">
              <LyricsEditor isEditingMoodBoard={isEditingMoodBoard} isFocusModeActive={isFocusModeActive} />
            </div>
          </main>
        )}

        {/* Preview */}
        <div 
          className={`live-preview fixed right-0 ${isEditingMoodBoard ? 'top-0' : 'top-16'} bottom-16 overflow-visible transition-all duration-300
            ${isMobile ? (isPreviewVisible ? 'w-full' : 'w-0') : (isPreviewCollapsed ? 'w-0' : 'w-96')}
            ${isMobile ? 'z-20' : ''}
          `}
        >
          <div className={`bg-[${theme.common.grey}] h-full rounded-l-lg relative bg-opacity-0`}>
            <div className={`overflow-y-auto h-full pt-4 px-4 transition-opacity duration-300 ${
              (isMobile ? !isPreviewVisible : isPreviewCollapsed) || isFocusModeActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              <LivePreview />
            </div>
            {!isMobile && !isEditingMoodBoard && !isFocusModeActive && (
              <button
                onClick={togglePreview}
                className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-full ${isPreviewCollapsed ? '-left-6' : 'left-0 -translate-x-full'}`}
              >
                {isPreviewCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
      <Toolbar 
        isMoodBoardVisible={isMoodBoardVisible}
        setIsMoodBoardVisible={setIsMoodBoardVisible}
        isEditingMoodBoard={isEditingMoodBoard}
        setIsEditingMoodBoard={setIsEditingMoodBoard}
        isFocusModeActive={isFocusModeActive}
        toggleFocusMode={toggleFocusMode}
        className="toolbar"
      />

      {showOnboarding && (
        <Onboarding 
          onClose={handleCloseOnboarding}
          isDarkMode={isDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          isPreviewCollapsed={isPreviewCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          setIsPreviewCollapsed={setIsPreviewCollapsed}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

export default App;