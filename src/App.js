import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LyricsEditor from './components/LyricsEditor';
import LivePreview from './components/LivePreview';
import { loadSongs } from './store/songSlice';
import { loadSongsFromLocalStorage } from './utils/localStorage';

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
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0D0C0C] text-[#F2F2F2]' : 'bg-[#F2F2F2] text-[#0D0C0C]'}`}>
      <Header />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col md:flex-row justify-center">
          <div className="w-full md:w-[calc(100%-24rem)] max-w-3xl px-4 overflow-hidden">
            <div className="w-full overflow-auto">
              <LyricsEditor />
            </div>
          </div>
          <div className="w-full md:w-96 flex justify-center">
            <div className="w-full h-full overflow-hidden">
              <LivePreview onCopyLyrics={handleCopyLyrics} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;