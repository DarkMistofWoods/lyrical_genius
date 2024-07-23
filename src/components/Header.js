import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import theme from '../theme';

function Header() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <header className={`bg-[${currentTheme.background}] text-[${currentTheme.text}] p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50`}>
      <h1 className="text-2xl font-bold">Lyrical Genius (you!)</h1>
      <button 
        onClick={() => dispatch(toggleTheme())}
        className={`bg-[${isDarkMode ? theme.common.white : theme.common.black}] text-[${isDarkMode ? theme.common.black : theme.common.white}] px-4 py-2 rounded-full`}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </header>
  );
}

export default Header;