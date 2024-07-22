import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LyricsEditor from './components/LyricsEditor';
import LivePreview from './components/LivePreview';
import { loadSongs } from './store/songSlice';
import { loadSongsFromLocalStorage } from './utils/localStorage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedSongs = loadSongsFromLocalStorage();
    dispatch(loadSongs(savedSongs));
  }, [dispatch]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex">
          <LyricsEditor />
          <LivePreview />
        </main>
      </div>
    </div>
  );
}

export default App;