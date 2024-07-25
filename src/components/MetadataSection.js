import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateStyle } from '../store/songSlice';
import SearchableDropdown from './SearchableDropdown';
import theme from '../theme';

// Import style options
import vocalsOptions from '../data/vocals.json';
import genreOptions from '../data/genres.json';
import instrumentsOptions from '../data/instruments.json';
import moodsOptions from '../data/moods.json';

const styleOptions = {
  vocals: vocalsOptions,
  genre: genreOptions,
  instruments: instrumentsOptions,
  mood: moodsOptions
};

function MetadataSection({ currentSong, saveChanges }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [customStyle, setCustomStyle] = useState('');

  const handleStyleChange = (category, selectedValues) => {
    const newStyle = { ...currentSong.style, [category]: selectedValues };
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

  // Ensure all style properties are arrays
  const safeStyle = {
    vocals: [],
    genre: [],
    instruments: [],
    mood: [],
    custom: [],
    ...currentSong.style
  };

  return (
    <div className={`bg-[${theme.common.grey}] p-4 rounded-lg`}>
      {/* Style options */}
      <div className="flex flex-wrap items-center gap-2 mb-2 w-full">
        {Object.entries(styleOptions).map(([key, options]) => (
          <div key={key} className="flex-grow min-w-[120px] max-w-[200px]">
            <SearchableDropdown
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              options={options}
              selectedValues={currentSong.style[key] || []}
              onChange={(selectedValues) => handleStyleChange(key, selectedValues)}
              labelColor={theme.common.white}
            />
          </div>
        ))}
      </div>

      {/* Custom style input */}
      <div className="flex mb-2 w-full">
        <input
          type="text"
          placeholder="Custom style"
          value={customStyle}
          onChange={(e) => setCustomStyle(e.target.value)}
          className={`flex-grow p-1 text-sm border rounded-l border-[#403E3F] ${
            isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2]' : 'bg-[#F2F2F2] text-[#0D0C0C]'
          }`}
        />
        <button
          onClick={addCustomStyle}
          className="bg-[#A68477] text-[#F2F2F2] p-2 text-sm rounded-r hover:opacity-80"
        >
          Add
        </button>
      </div>

      {/* Display selected styles */}
      <div className="flex flex-wrap gap-1 justify-center">
        {Object.entries(safeStyle).flatMap(([category, values]) =>
          values.map(value => (
            <span
              key={`${category}-${value}`}
              className={`px-2 py-0.5 text-xs rounded flex items-center bg-[#403E3F] text-[${theme.common.white}]`}
            >
              {value}
              <button
                onClick={() => removeStyle(category, value)}
                className="ml-1 text-[#F2F2F2] hover:text-[#0D0C0C]"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export default MetadataSection;