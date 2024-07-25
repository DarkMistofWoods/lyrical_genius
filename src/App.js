import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LyricsEditor from './components/LyricsEditor';
import LivePreview from './components/LivePreview';
import Toolbar from './components/Toolbar';
import { loadSongs } from './store/songSlice';
import { loadSongsFromLocalStorage } from './utils/localStorage';
import theme from './theme';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong } = useSelector(state => state.song);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

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

  return (
    <div className={`min-h-screen bg-[${isDarkMode ? theme.dark.background : theme.light.background}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
      <Header />
      <div className="flex pt-4 pb-16"> {/* Add bottom padding to account for the toolbar */}
        {/* Sidebar */}
        <div 
          className={`fixed left-0 top-[calc(4rem+0.5rem)] bottom-16 overflow-visible transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'w-12' : 'w-96'
          }`}
        >
          <div className={`bg-[${theme.common.grey}] h-full rounded-r-lg relative`}>
            <div className="overflow-y-auto h-full pt-4 px-4">
              {!isSidebarCollapsed && <Sidebar />}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`absolute top-1/2 -right-4 bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-full`}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-12' : 'ml-96'
        } ${isPreviewCollapsed ? 'mr-12' : 'mr-96'}`}>
          <div className="max-w-3xl mx-auto px-4">
            <LyricsEditor />
          </div>
        </main>

        {/* Preview */}
        <div 
          className={`fixed right-0 top-[calc(4rem+0.5rem)] bottom-16 overflow-visible transition-all duration-300 ease-in-out ${
            isPreviewCollapsed ? 'w-12' : 'w-96'
          }`}
        >
          <div className={`bg-[${theme.common.grey}] h-full rounded-l-lg relative`}>
            <div className="overflow-y-auto h-full pt-4 px-4">
              {!isPreviewCollapsed && <LivePreview onCopyLyrics={handleCopyLyrics} />}
            </div>
            <button
              onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
              className={`absolute top-1/2 -left-4 bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-full`}
            >
              {isPreviewCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
      <Toolbar onUndo={handleUndo} />
    </div>
  );
}

export default App;