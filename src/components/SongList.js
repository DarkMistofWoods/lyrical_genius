import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentSong, addSong, deleteSong } from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';

function SongList() {
  const dispatch = useDispatch();
  const { songs, currentSong } = useSelector(state => state.song);

  const handleSelectSong = (song) => {
    dispatch(setCurrentSong(song));
  };

  const handleNewSong = () => {
    dispatch(addSong());
    saveSongsToLocalStorage(songs);
  };

  const handleDeleteSong = (id) => {
    dispatch(deleteSong(id));
    saveSongsToLocalStorage(songs.filter(song => song.id !== id));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Your Songs</h2>
      <ul className="mb-4">
        {songs.map(song => (
          <li key={song.id} className="flex justify-between items-center mb-2">
            <button
              onClick={() => handleSelectSong(song)}
              className={`text-left truncate ${currentSong.id === song.id ? 'font-bold' : ''}`}
            >
              {song.title || 'Untitled'}
            </button>
            <button
              onClick={() => handleDeleteSong(song.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handleNewSong}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        New Song
      </button>
    </div>
  );
}

export default SongList;