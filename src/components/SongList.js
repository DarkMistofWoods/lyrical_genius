import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentSong, addSong, deleteSong } from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';

function SongList() {
  const dispatch = useDispatch();
  const { songs, currentSong } = useSelector(state => state.song);
  const [songToDelete, setSongToDelete] = useState(null);

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

  return (
    <div className="relative">
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
      {songToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
            <p className="mb-4 text-center">Are you sure you want to delete this song? This action cannot be undone.</p>
            <div className="flex justify-center">
              <button
                onClick={cancelDeleteSong}
                className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSong}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SongList;