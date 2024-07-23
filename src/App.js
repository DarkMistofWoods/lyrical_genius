import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LyricsEditor from './components/LyricsEditor';
import LivePreview from './components/LivePreview';
import { loadSongs } from './store/songSlice';
import { loadSongsFromLocalStorage } from './utils/localStorage';
import theme from './theme';

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong } = useSelector(state => state.song);

  useEffect(() => {
    const savedSongs = loadSongsFromLocalStorage();
    dispatch(loadSongs(savedSongs));
  }, [dispatch]);

  const handleCopyLyrics = () => {
    const formattedLyrics = `${currentSong.title}\n\n${currentSong.lyrics}\n\nStyle: ${Object.entries(currentSong.style)
      .filter(([_, values]) => values.length > 0)
      .map(([category, values]) => `${category}: ${values.join(', ')}`)
      .join(' | ')}`;
    
    navigator.clipboard.writeText(formattedLyrics)
      .then(() => alert('Lyrics copied to clipboard!'))
      .catch(err => console.error('Failed to copy lyrics: ', err));
  };

  return (
    <div className={`min-h-screen bg-[${isDarkMode ? theme.dark.background : theme.light.background}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
      <Header />
      <div className="flex pt-4">
        <div className="w-96 fixed left-0 top-16 bottom-0 overflow-y-auto pt-4">
          <Sidebar />
        </div>
        <main className="ml-96 flex-1 pr-96">
          <div className="max-w-3xl mx-auto px-4">
            <LyricsEditor />
          </div>
        </main>
        <div className="fixed right-0 top-16 bottom-0 w-96 p-4 overflow-y-auto">
          <LivePreview onCopyLyrics={handleCopyLyrics} />
        </div>
      </div>
    </div>
  );
}

export default App;