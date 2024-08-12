import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import theme from '../theme';
import { Menu, Sun, Moon, Eye, List, HelpCircle } from 'lucide-react';

function Header({ 
  isFocusModeActive, 
  togglePreview, 
  toggleSongList, 
  isPreviewVisible, 
  isSongListVisible,
  showHelpIcon,
  onOpenOnboarding
}) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMobileAction = (action) => {
    action();
    setIsMenuOpen(false);
  };

  const gradientStyle = isDarkMode
    ? 'linear-gradient(180deg, rgba(13,12,12,1) 75%, rgba(0,0,0,0) 100%)'
    : 'linear-gradient(180deg, rgba(242,242,242,1) 75%, rgba(0,0,0,0) 100%)';

  return (
    <header className={`
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
    `}
    style={{
      background: gradientStyle,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}
    >
      <div className="flex justify-between items-center">
        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Lyrical Genius (you!)</h1>
        <button 
          onClick={toggleMenu}
          className={`md:hidden ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center">
          <a 
            href="https://suno.com/@digital_takeover" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`mr-4 hover:underline ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
          >
            Follow me on Suno: @digital_takeover
          </a>
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`bg-${isDarkMode ? 'white' : 'black'} text-${isDarkMode ? 'gray-800' : 'white'} px-4 py-2 rounded-full transition-colors duration-300 mr-2`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {showHelpIcon && (
            <button
              onClick={onOpenOnboarding}
              className={`bg-${isDarkMode ? 'white' : 'black'} text-${isDarkMode ? 'gray-800' : 'white'} px-4 py-2 rounded-full transition-colors duration-300`}
            >
              <HelpCircle size={20} />
            </button>
          )}
        </div>
      </div>
      
      <div 
        className={`md:hidden mt-4 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <button 
          onClick={() => handleMobileAction(togglePreview)}
          className={`w-full text-left py-2 px-4 rounded-2xl bg-[${theme.common.brown}] text-${isDarkMode ? 'white' : 'black'}`}
        >
          <Eye size={20} className="inline mr-2" /> Toggle Preview
        </button>
        <button 
          onClick={() => handleMobileAction(toggleSongList)}
          className={`w-full text-left py-2 px-4 rounded-2xl bg-[${theme.common.brown}] text-${isDarkMode ? 'white' : 'black'}`}
        >
          <List size={20} className="inline mr-2" /> Toggle Song List
        </button>
        <button 
          onClick={() => dispatch(toggleTheme())}
          className={`w-full text-left py-2 px-4 rounded-2xl bg-[${theme.common.brown}] text-${isDarkMode ? 'white' : 'black'}`}
        >
          {isDarkMode ? <Sun size={20} className="inline mr-2" /> : <Moon size={20} className="inline mr-2" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {showHelpIcon && (
          <button
            onClick={onOpenOnboarding}
            className={`w-full text-left py-2 px-4 rounded-2xl bg-[${theme.common.brown}] text-${isDarkMode ? 'white' : 'black'}`}
          >
            <HelpCircle size={20} className="inline mr-2" /> Help
          </button>
        )}
        <a 
          href="https://suno.com/@digital_takeover" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`block py-1 border-2 rounded-3xl px-4 border-[${theme.common.brown}] text-${isDarkMode ? 'white' : 'black'}`}
        >
          Follow me on Suno: @digital_takeover
        </a>
      </div>
    </header>
  );
}

export default Header;