import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateStyle } from '../store/songSlice';
import theme from '../theme';
import { ChevronDown, ChevronUp, X, Plus } from 'lucide-react';

// Import style options
import vocalsOptions from '../data/vocals.json';
import genreOptions from '../data/genres.json';
import instrumentsOptions from '../data/instruments.json';
import moodsOptions from '../data/moods.json';

const allOptions = [
  { category: 'Vocals', options: vocalsOptions },
  { category: 'Genre', options: genreOptions },
  { category: 'Instruments', options: instrumentsOptions },
  { category: 'Mood', options: moodsOptions }
];

function MetadataSection({ currentSong, saveChanges }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStyleChange = (category, value) => {
    const newStyle = JSON.parse(JSON.stringify(currentSong.style)); // Deep clone
    const categoryArray = newStyle[category.toLowerCase()] || [];
    
    if (!categoryArray.includes(value)) {
      categoryArray.push(value);
      newStyle[category.toLowerCase()] = categoryArray;

      const totalLength = Object.values(newStyle)
        .flat()
        .join(', ')
        .length;

      if (totalLength <= 120) {
        dispatch(updateStyle(newStyle));
        saveChanges({ ...currentSong, style: newStyle });
      } else {
        alert("Total length of selected styles cannot exceed 120 characters.");
      }
    }
  };

  const addCustomStyle = () => {
    if (customStyle.trim()) {
      const newStyle = JSON.parse(JSON.stringify(currentSong.style)); // Deep clone
      newStyle.custom = [...(newStyle.custom || []), customStyle.trim()];
      
      const totalLength = Object.values(newStyle)
        .flat()
        .join(', ')
        .length;

      if (totalLength <= 120) {
        dispatch(updateStyle(newStyle));
        saveChanges({ ...currentSong, style: newStyle });
        setCustomStyle('');
      } else {
        alert("Adding this custom style would exceed the 120 character limit for all styles.");
      }
    }
  };

  const removeStyle = (category, value) => {
    const newStyle = JSON.parse(JSON.stringify(currentSong.style)); // Deep clone
    newStyle[category] = newStyle[category].filter(v => v !== value);
    dispatch(updateStyle(newStyle));
    saveChanges({ ...currentSong, style: newStyle });
  };

  const filteredOptions = allOptions
    .filter(categoryGroup => selectedCategory === 'All' || categoryGroup.category === selectedCategory)
    .map(categoryGroup => ({
      ...categoryGroup,
      options: categoryGroup.options.filter(option =>
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(categoryGroup => categoryGroup.options.length > 0);

  const isStyleSelected = (category, value) => {
    return currentSong.style[category.toLowerCase()]?.includes(value) || false;
  };

  return (
    <div className={`bg-[${theme.common.grey}] p-4 rounded-lg relative`}>
      {/* Display selected styles */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Object.entries(currentSong.style).flatMap(([category, values]) =>
          values.map(value => (
            <span
              key={`${category}-${value}`}
              className={`px-2 py-1 text-xs rounded flex items-center bg-[${theme.common.brown}] text-[${theme.common.white}]`}
            >
              {value}
              <button
                onClick={() => removeStyle(category, value)}
                className="ml-1 text-[${theme.common.white}] hover:text-[${theme.common.black}]"
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>

      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full p-2 text-left bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] border border-[${theme.common.grey}] rounded flex justify-between items-center`}
        >
          <span>Select styles</span>
          {isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isDropdownOpen && (
          <div className={`fixed left-1/2 transform -translate-x-1/2 z-[9999] mt-1 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border border-[${theme.common.grey}] rounded shadow-lg`} style={{width: 'calc(100% - 2rem)', maxWidth: '600px', maxHeight: '60vh', overflowY: 'auto'}}>
            <div className="p-2 border-b border-[${theme.common.grey}]">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search styles..."
                  className={`flex-grow p-2 bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] rounded mr-2`}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`p-2 bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] rounded`}
                >
                  <option value="All">All</option>
                  {allOptions.map(category => (
                    <option key={category.category} value={category.category}>{category.category}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Add custom style"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  className={`flex-grow p-2 text-sm bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] rounded-l border-r border-[${theme.common.grey}]`}
                />
                <button
                  onClick={addCustomStyle}
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded-r hover:opacity-80 flex items-center justify-center`}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            {filteredOptions.map((categoryGroup, index) => (
              <div key={index}>
                <h3 className={`pl-2 rounded-lg font-bold bg-[${theme.common.brown}] text-[${theme.common.white}]`}>
                  {categoryGroup.category}
                </h3>
                {categoryGroup.options.map((option) => (
                  <div
                    key={option.value}
                    className={`p-2 cursor-pointer transition-colors duration-200 ${
                      isStyleSelected(categoryGroup.category, option.value)
                        ? `text-[${theme.common.white}]`
                        : `text-[${isDarkMode ? theme.dark.text : theme.light.text}] hover:bg-[${theme.common.brown}] hover:bg-opacity-50 hover:text-[${theme.common.white}]`
                    }`}
                    onClick={() => handleStyleChange(categoryGroup.category, option.value)}
                  >
                    {option.value}
                    {isStyleSelected(categoryGroup.category, option.value) && (
                      <span className="ml-2">✓</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MetadataSection;