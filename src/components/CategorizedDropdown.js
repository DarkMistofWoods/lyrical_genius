import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import theme from '../theme';

const categories = [
  {
    name: 'Lyric Sections',
    items: ['Verse', 'Chorus', 'Pre-Chorus', 'Bridge', 'Hook', 'Line', 'Dialog', 'Custom']
  },
  {
    name: 'Structure Modifiers',
    items: ['Intro', 'Outro', 'Interlude', 'Instrumental', 'Break', 'End', 'Drop', 'Custom']
  }
];

const CategorizedDropdown = ({ onSelect, isDarkMode, buttonRef }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [isSubDropdownVisible, setIsSubDropdownVisible] = useState(false);
  const [subDropdownPosition, setSubDropdownPosition] = useState({ top: 0, left: 0 });
  const mainDropdownRef = useRef(null);
  const subDropdownRef = useRef(null);

  useEffect(() => {
    if (activeCategory !== null && buttonRef.current && mainDropdownRef.current && subDropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const mainDropdownRect = mainDropdownRef.current.getBoundingClientRect();
      const subDropdownRect = subDropdownRef.current.getBoundingClientRect();

      let top = buttonRect.top - subDropdownRect.height;
      let left = buttonRect.left;

      // Ensure the sub-dropdown doesn't go off the left edge of the screen
      if (left < 0) {
        left = 0;
      }

      // If there's not enough space above, position it below the button
      if (top < 0) {
        top = buttonRect.bottom;
      }

      setSubDropdownPosition({ top, left });
      // Delay setting visibility to allow for position calculation
      setTimeout(() => setIsSubDropdownVisible(true), 50);
    } else {
      setIsSubDropdownVisible(false);
    }
  }, [activeCategory, buttonRef]);

  return (
    <div ref={mainDropdownRef} className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border rounded shadow-lg`}>
      {activeCategory === null ? (
        // Main category selection
        categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(index)}
            className={`flex justify-between items-center w-full text-left px-4 py-2 hover:bg-[${theme.common.brown}] text-[${isDarkMode ? theme.common.white : theme.common.black}]`}
          >
            {category.name}
            <ChevronRight size={16} />
          </button>
        ))
      ) : (
        // Items within the selected category
        <div
          ref={subDropdownRef}
          style={{
            position: 'fixed',
            top: `${subDropdownPosition.top}px`,
            left: `${subDropdownPosition.left}px`,
            opacity: isSubDropdownVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
          className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border rounded shadow-lg`}
        >
          {categories[activeCategory].items.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelect(categories[activeCategory].name, item)}
              className={`block w-full text-left px-4 py-2 hover:bg-[${theme.common.brown}] text-[${isDarkMode ? theme.common.white : theme.common.black}]`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => {
              setActiveCategory(null);
              setIsSubDropdownVisible(false);
            }}
            className={`w-full text-left px-4 py-2 font-bold hover:bg-[${theme.common.brown}] text-[${isDarkMode ? theme.common.white : theme.common.black}]`}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorizedDropdown;