import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentSong, addSong, deleteSong } from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';
import theme from '../theme';
import ReactDOM from 'react-dom';
import { Search, X } from 'lucide-react';

function SongList() {
  const dispatch = useDispatch();
  const { songs, currentSong } = useSelector(state => state.song);
  const [songToDelete, setSongToDelete] = useState(null);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(songs);

  useEffect(() => {
    const filtered = songs.filter(song => 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(song.style).flat().some(style => 
        style.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredSongs(filtered);
  }, [searchTerm, songs]);

  const handleSelectSong = (song) => {
    dispatch(setCurrentSong(song));
  };

  const handleNewSong = () => {
    dispatch(addSong());
    saveSongsToLocalStorage(songs);
  };

  const handleDeleteSong = (id) => {
    setSongToDelete(id);
  };

  const confirmDeleteSong = () => {
    if (songToDelete) {
      dispatch(deleteSong(songToDelete));
      saveSongsToLocalStorage(songs.filter(song => song.id !== songToDelete));
      setSongToDelete(null);
    }
  };

  const cancelDeleteSong = () => {
    setSongToDelete(null);
  };

  const handleStyleClick = (style, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSearchTerm(style);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const DeleteConfirmationDialog = () => {
    if (!songToDelete) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className={`bg-[${theme.common.white}] p-4 rounded shadow-lg max-w-sm w-full`}>
          <p className={`mb-4 text-center text-[${theme.common.black}]`}>
            Are you sure you want to delete this song? This action cannot be undone.
          </p>
          <div className="flex justify-center">
            <button
              onClick={cancelDeleteSong}
              className={`mr-2 px-4 py-2 bg-[${theme.common.grey}] text-[${theme.common.white}] rounded hover:opacity-80`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteSong}
              className={`px-4 py-2 bg-red-500 text-[${theme.common.white}] rounded hover:opacity-80`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Your Songs</h2>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full p-2 pl-8 pr-8 text-sm border rounded ${
            isDarkMode
              ? `bg-[${theme.dark.input}] text-[${theme.common.white}] border-[${theme.common.grey}]`
              : `bg-[${theme.light.input}] text-[${theme.common.black}] border-[${theme.common.grey}]`
          }`}
        />
        <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <ul className="mb-4 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
        {filteredSongs.map(song => (
          <li 
            key={song.id} 
            className={`p-2 rounded transition-colors duration-200 ${
              currentSong.id === song.id 
                ? 'bg-[#595859]' 
                : 'bg-[#403E3F] hover:bg-[#4a4849]'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <button
                onClick={() => handleSelectSong(song)}
                className={`text-left truncate flex-grow ${currentSong.id === song.id ? 'font-bold' : ''}`}
              >
                {song.title || 'Untitled'}
              </button>
              <button
                onClick={() => handleDeleteSong(song.id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                Delete
              </button>
            </div>
            <div className="text-xs text-gray-400 italic">
              {Object.values(song.style).flat().filter(Boolean).map((style, index, array) => (
                <React.Fragment key={index}>
                  <button
                    onClick={(e) => handleStyleClick(style, e)}
                    className="hover:underline"
                  >
                    {style}
                  </button>
                  {index < array.length - 1 && ", "}
                </React.Fragment>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={handleNewSong}
        className={`w-full bg-[${theme.common.brown}] text-[${theme.common.white}] py-2 px-4 rounded hover:opacity-80`}
      >
        New Song
      </button>
      <DeleteConfirmationDialog />
    </div>
  );
}

export default SongList;