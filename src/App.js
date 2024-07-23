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

  useEffect(() => {
    const savedSongs = loadSongsFromLocalStorage();
    dispatch(loadSongs(savedSongs));
  }, [dispatch]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Header />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col md:flex-row overflow-auto">
          <LyricsEditor />
          <LivePreview />
        </main>
      </div>
    </div>
  );
}

export default App;