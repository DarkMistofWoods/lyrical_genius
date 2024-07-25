import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import theme from '../theme';

const categories = [
  {
    name: 'Lyric Sections',
    items: ['Verse', 'Chorus', 'Bridge', 'Pre-Chorus', 'Line', 'Dialog']
  },
  {
    name: 'Structure Modifiers',
    items: ['Intro', 'Outro', 'Hook', 'Interlude', 'Instrumental', 'Break', 'End', 'Bass Drop', 'Beat Drop']
  },
  // Uncomment when ready to implement Vocal Modifiers
  // {
  //   name: 'Vocal Modifiers',
  //   items: ['Whisper', 'Shout', 'Harmony', 'Ad-lib']
  // }
];

const CategorizedDropdown = ({ onSelect, isDarkMode }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border rounded shadow-lg`}>
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
        <>
          <button
            onClick={() => setActiveCategory(null)}
            className={`w-full text-left px-4 py-2 font-bold hover:bg-[${theme.common.brown}] text-[${isDarkMode ? theme.common.white : theme.common.black}]`}
          >
            ← Back
          </button>
          {categories[activeCategory].items.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelect(categories[activeCategory].name, item)}
              className={`block w-full text-left px-4 py-2 hover:bg-[${theme.common.brown}] text-[${isDarkMode ? theme.common.white : theme.common.black}]`}
            >
              {item}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default CategorizedDropdown;