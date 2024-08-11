import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import theme from '../theme';
import { Menu, Sun, Moon, Eye, List } from 'lucide-react';

function Header({ isFocusModeActive, togglePreview, toggleSongList }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={`
      bg-[${currentTheme.background}] 
      text-[${currentTheme.text}] 
      bg-opacity-45 
      p-4 
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Lyrical Genius (you!)</h1>
        <button 
          onClick={toggleMenu}
          className="md:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center">
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
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          <button 
            onClick={togglePreview}
            className={`w-full text-left py-2 px-4 rounded bg-[${theme.common.grey}] text-[${currentTheme.text}]`}
          >
            <Eye size={20} className="inline mr-2" /> Toggle Preview
          </button>
          <button 
            onClick={toggleSongList}
            className={`w-full text-left py-2 px-4 rounded bg-[${theme.common.grey}] text-[${currentTheme.text}]`}
          >
            <List size={20} className="inline mr-2" /> Toggle Song List
          </button>
          <button 
            onClick={() => dispatch(toggleTheme())}
            className={`w-full text-left py-2 px-4 rounded bg-[${theme.common.grey}] text-[${currentTheme.text}]`}
          >
            {isDarkMode ? <Sun size={20} className="inline mr-2" /> : <Moon size={20} className="inline mr-2" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <a 
            href="https://suno.com/@digital_takeover" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`block py-2 px-4 text-[${currentTheme.text}]`}
          >
            Follow me on Suno: @digital_takeover
          </a>
        </div>
      )}
    </header>
  );
}

export default Header;