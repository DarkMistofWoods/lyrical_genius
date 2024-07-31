import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateStyle } from '../store/songSlice';
import theme from '../theme';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

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
    const newStyle = { ...currentSong.style };
    const categoryArray = newStyle[category.toLowerCase()] || [];
    const valueIndex = categoryArray.indexOf(value);

    if (valueIndex === -1) {
      categoryArray.push(value);
    } else {
      categoryArray.splice(valueIndex, 1);
    }

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
  };

  const addCustomStyle = () => {
    if (customStyle.trim()) {
      const newStyle = {
        ...currentSong.style,
        custom: [...(currentSong.style.custom || []), customStyle.trim()]
      };
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
    const newStyle = {
      ...currentSong.style,
      [category]: currentSong.style[category].filter(v => v !== value)
    };
    dispatch(updateStyle(newStyle));
    saveChanges({ ...currentSong, style: newStyle });
  };

  const filteredOptions = allOptions.map(categoryGroup => {
    return {
      ...categoryGroup,
      options: categoryGroup.options.filter(option => {
        const shouldInclude = option && option.value && option.value.toLowerCase().includes(searchTerm.toLowerCase());
        return shouldInclude;
      })
    };
  }).filter(categoryGroup => {
    return categoryGroup.options.length > 0;
  });

  return (
    <div className={`bg-[${theme.common.grey}] p-4 rounded-lg`}>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full p-2 text-left bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] border border-[${theme.common.grey}] rounded flex justify-between items-center`}
        >
          <span>Select styles</span>
          {isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isDropdownOpen && (
          <div className={`absolute z-10 w-full mt-1 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border border-[${theme.common.grey}] rounded shadow-lg`}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search styles..."
              className={`w-full p-2 bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] border-b border-[${theme.common.grey}]`}
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((categoryGroup, index) => (
                  <div key={index}>
                    <h3 className={`p-2 font-bold bg-[${theme.common.brown}] text-[${theme.common.white}]`}>
                      {categoryGroup.category}
                    </h3>
                    {categoryGroup.options.map((option) => (
                      <div
                        key={option.value}
                        className={`p-2 cursor-pointer hover:bg-[${isDarkMode ? theme.dark.background : theme.light.background}]`}
                        onClick={() => handleStyleChange(categoryGroup.category, option.value)}
                      >
                        <input
                          type="checkbox"
                          checked={currentSong.style[categoryGroup.category.toLowerCase()]?.includes(option.value) || false}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        {option.value}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-2">No matching options found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom style input */}
      <div className="flex mt-4">
        <input
          type="text"
          placeholder="Custom style"
          value={customStyle}
          onChange={(e) => setCustomStyle(e.target.value)}
          className={`flex-grow p-2 text-sm border rounded-l border-[${theme.common.grey}] bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
        />
        <button
          onClick={addCustomStyle}
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 text-sm rounded-r hover:opacity-80`}
        >
          Add
        </button>
      </div>

      {/* Display selected styles */}
      <div className="flex flex-wrap gap-1 mt-2">
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
    </div>
  );
}

export default MetadataSection;