import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import theme from '../theme';

function Header({ isFocusModeActive }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <header className={`
      bg-[${currentTheme.background}] 
      text-[${currentTheme.text}] 
      bg-opacity-45 
      p-4 
      flex 
      justify-between 
      items-center 
      fixed 
      top-0 
      left-0 
      right-0 
      z-50
      transition-transform 
      duration-300 
      ease-in-out
      ${isFocusModeActive ? '-translate-y-full' : 'translate-y-0'}
    `}>
      <h1 className="text-2xl font-bold">Lyrical Genius (you!)</h1>
      <div className="flex items-center">
        <a 
          href="https://suno.com/@digital_takeover" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mr-4 hover:underline"
        >
          Follow me on Suno: @digital_takeover
        </a>
        <button 
          onClick={() => dispatch(toggleTheme())}
          className={`bg-[${isDarkMode ? theme.common.white : theme.common.black}] text-[${isDarkMode ? theme.common.black : theme.common.white}] px-4 py-2 rounded-full`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;