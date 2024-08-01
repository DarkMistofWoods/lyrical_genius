import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LyricsEditor from './components/LyricsEditor';
import LivePreview from './components/LivePreview';
import Toolbar from './components/Toolbar';
import MoodBoard from './components/MoodBoard';
import { loadSongs } from './store/songSlice';
import { loadSongsFromLocalStorage } from './utils/localStorage';
import theme from './theme';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { saveVersion } from './store/songSlice';

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong } = useSelector(state => state.song);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [isMoodBoardVisible, setIsMoodBoardVisible] = useState(true);
  const [isEditingMoodBoard, setIsEditingMoodBoard] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);

  useEffect(() => {
    const savedSongs = loadSongsFromLocalStorage();
    dispatch(loadSongs(savedSongs));
  }, [dispatch]);

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

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log('Undo action triggered');
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

  return (
    <div className={`min-h-screen bg-[${isDarkMode ? theme.dark.background : theme.light.background}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
      <MoodBoard isVisible={isMoodBoardVisible} isEditing={isEditingMoodBoard} />
      {!isEditingMoodBoard && <Header isFocusModeActive={isFocusModeActive} />}
      <div className={`flex ${isEditingMoodBoard ? 'pt-0' : 'pt-4'} pb-16`}>
        {/* Sidebar */}
        {!isEditingMoodBoard && (
          <div 
            className={`fixed left-0 ${isEditingMoodBoard ? 'top-0' : 'top-[calc(4rem+0.5rem)]'} bottom-16 overflow-visible transition-all duration-300 ${
              isSidebarCollapsed || isFocusModeActive ? '-translate-x-full' : 'translate-x-0'
            } ${
              isSidebarCollapsed ? 'w-12' : 'w-96'
            }`}
          >
            <div className={`bg-[${theme.common.grey}] h-full rounded-r-lg relative bg-opacity-0`}>
              <div className="overflow-y-auto h-full pt-4">
                {!isSidebarCollapsed && <Sidebar />}
              </div>
              {!isFocusModeActive && (
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className={`absolute top-1/2 -right-12 bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-full`}
                >
                  {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        {!isEditingMoodBoard && (
          <main className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed || isFocusModeActive ? 'ml-0' : 'ml-96'
          } ${isPreviewCollapsed || isFocusModeActive ? 'mr-0' : 'mr-96'}`}>
            <div className="max-w-3xl mx-auto px-4">
              <LyricsEditor isEditingMoodBoard={isEditingMoodBoard} isFocusModeActive={isFocusModeActive} />
            </div>
          </main>
        )}

        {/* Preview */}
        {!isEditingMoodBoard && (
          <div 
            className={`fixed right-0 ${isEditingMoodBoard ? 'top-0' : 'top-[calc(4rem+0.5rem)]'} bottom-16 overflow-visible transition-all duration-300 ease-in-out ${
              isPreviewCollapsed || isFocusModeActive ? 'translate-x-full' : 'translate-x-0'
            } ${
              isPreviewCollapsed ? 'w-12' : 'w-96'
            }`}
          >
            <div className={`bg-[${theme.common.grey}] h-full rounded-l-lg relative bg-opacity-0`}>
              <div className="overflow-y-auto h-full pt-4 px-4">
                {!isPreviewCollapsed && <LivePreview />}
              </div>
              {!isFocusModeActive && (
                <button
                  onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
                  className={`absolute top-1/2 -left-12 bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-full`}
                >
                  {isPreviewCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Toolbar 
        isMoodBoardVisible={isMoodBoardVisible}
        setIsMoodBoardVisible={setIsMoodBoardVisible}
        isEditingMoodBoard={isEditingMoodBoard}
        setIsEditingMoodBoard={setIsEditingMoodBoard}
        isFocusModeActive={isFocusModeActive}
        toggleFocusMode={toggleFocusMode}
      />
    </div>
  );
}

export default App;