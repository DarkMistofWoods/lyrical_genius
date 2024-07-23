import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';

function Header() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  return (
    <header className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-blue-600 text-white'} p-4 flex justify-between items-center`}>
      <h1 className="text-2xl font-bold">Lyrical Genius (you!)</h1>
      <button 
        onClick={() => dispatch(toggleTheme())}
        className={`${isDarkMode ? 'bg-yellow-400 text-gray-800' : 'bg-gray-800 text-yellow-400'} px-4 py-2 rounded-full`}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </header>
  );
}

export default Header; 