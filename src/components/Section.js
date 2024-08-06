import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { Settings, Copy, XCircle, ArrowUp, ArrowDown, Tag, X } from 'lucide-react';
import theme from '../theme';

const verseNumbers = [1, 2, 3, 4, 5, 6, 7];
const sectionTypes = ['Verse', 'Chorus', 'Pre-Chorus', 'Bridge', 'Hook', 'Line', 'Dialog'];
const structureModifiers = ['Intro', 'Outro', 'Interlude', 'Instrumental', 'Break', 'End', 'Drop'];
const modifiers = ['Sad', 'Happy', 'Angry', 'Fast', 'Slow'];

function Section({ 
  section, 
  index, 
  editingSectionAt,
  setEditingSectionAt, 
  duplicateSection, 
  changeVerseNumber, 
  removeSection, 
  moveSection, 
  handleSectionChange,
  sectionsLength,
  changeSectionType,
  addModifier,
  removeModifier,
  isFocusMode
}) {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [showModifierDropdown, setShowModifierDropdown] = useState(false);
  const [customModifier, setCustomModifier] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [modifierPosition, setModifierPosition] = useState('prefix');
  const modifierButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const iconButtonStyle = `
    w-6 h-6 
    p-1
    mr-1 ml-1
    flex items-center justify-center 
    rounded-lg
    bg-[${isDarkMode ? theme.dark.background : theme.light.background}]
    bg-opacity-50
    text-[${isDarkMode ? theme.dark.text : theme.light.text}] 
    hover:bg-opacity-100
    hover:text-[${theme.common.white}] 
    transition-colors
  `;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !modifierButtonRef.current.contains(event.target)) {
        setShowModifierDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function updateDropdownPosition() {
      if (showModifierDropdown && modifierButtonRef.current) {
        const buttonRect = modifierButtonRef.current.getBoundingClientRect();
        const dropdownHeight = 200; // Estimate the height of the dropdown

        let top, left;
        if (buttonRect.bottom + dropdownHeight <= window.innerHeight) {
          top = buttonRect.bottom;
        } else {
          top = Math.max(0, buttonRect.top - dropdownHeight);
        }

        left = buttonRect.left;

        setDropdownPosition({ top, left });
      }
    }

    updateDropdownPosition();

    window.addEventListener('scroll', updateDropdownPosition);
    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showModifierDropdown]);

  const capitalizeFirstLetter = (string) => {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleModifierSelect = (modifier) => {
  modifier = capitalizeFirstLetter(modifier);
  if (section.type === 'StructureModifier') {
    const baseContent = capitalizeFirstLetter(section.content);
    let currentModifiers = section.modifier ? section.modifier.split(' ') : [];
    let prefixes = currentModifiers.filter(m => !m.toLowerCase().includes(baseContent.toLowerCase()));
    let suffixes = currentModifiers.filter(m => m.toLowerCase().includes(baseContent.toLowerCase())).map(m => m.replace(new RegExp(baseContent, 'i'), '')).filter(m => m);

    if (modifierPosition === 'prefix' && prefixes.length < 2) {
      prefixes.push(modifier);
    } else if (modifierPosition === 'suffix' && suffixes.length < 2) {
      suffixes.push(modifier);
    } else {
      alert("Maximum number of modifiers reached for this position.");
      setShowModifierDropdown(false);
      return;
    }

    let newModifier = [...prefixes, baseContent, ...suffixes].join(' ').trim();
    addModifier(index, newModifier);
  } else {
    // For Lyric Sections, allow only prefix
    const currentTags = section.modifier ? section.modifier.split(' ') : [];
    if (currentTags.length < 2) {
      addModifier(index, currentTags.length === 0 ? modifier : `${modifier} ${currentTags[0]}`);
    }
  }
  setShowModifierDropdown(false);
  setCustomModifier('');
};

  const handleCustomModifierSubmit = (e) => {
    e.preventDefault();
    if (customModifier.trim()) {
      handleModifierSelect(customModifier.trim());
    }
  };

  const handleRemoveModifier = (tagToRemove) => {
    if (section.type === 'StructureModifier') {
      const words = section.modifier ? section.modifier.split(' ') : [];
      const baseContent = section.content.toLowerCase();
      const newWords = words.filter(word => 
        word.toLowerCase() !== tagToRemove.toLowerCase() && 
        word.toLowerCase() !== baseContent
      );
      if (!newWords.some(word => word.toLowerCase() === baseContent)) {
        newWords.push(capitalizeFirstLetter(baseContent));
      }
      const newModifier = newWords.join(' ');
      removeModifier(index, newModifier !== capitalizeFirstLetter(baseContent) ? newModifier : null);
    } else {
      const currentTags = section.modifier ? section.modifier.split(' ') : [];
      const updatedTags = currentTags.filter(tag => tag.toLowerCase() !== tagToRemove.toLowerCase());
      removeModifier(index, updatedTags.join(' ') || null);
    }
  };

  const displayLabel = () => {
    if (section.type === 'StructureModifier') {
      if (section.modifier) {
        // Split the modifier into words
        const words = section.modifier.split(' ');
        // Check if the base content is already included in the modifier
        if (!words.some(word => word.toLowerCase() === section.content.toLowerCase())) {
          // If not included, append the base content
          words.push(section.content);
        }
        return words.map(capitalizeFirstLetter).join(' ');
      } else {
        return capitalizeFirstLetter(section.content);
      }
    } else {
      const tags = section.modifier ? section.modifier.split(' ') : [];
      const baseLabel = section.type;
      return `${tags.map(capitalizeFirstLetter).join(' ')} ${baseLabel}`.trim();
    }
  };

  const renderModifierDropdown = () => (
    ReactDOM.createPortal(
      <div 
        ref={dropdownRef}
        className={`fixed z-50 ${isDarkMode ? 'bg-[#595859]' : 'bg-[#F2F2F2]'} border border-[#595859] rounded shadow-lg`}
        style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
      >
        {section.type === 'StructureModifier' && (
          <div className="flex justify-around p-2 border-b border-[#595859]">
            <button
              onClick={() => setModifierPosition('prefix')}
              className={`px-2 py-1 rounded ${modifierPosition === 'prefix' ? 'bg-[#A68477] text-white' : ''}`}
            >
              Prefix
            </button>
            <button
              onClick={() => setModifierPosition('suffix')}
              className={`px-2 py-1 rounded ${modifierPosition === 'suffix' ? 'bg-[#A68477] text-white' : ''}`}
            >
              Suffix
            </button>
          </div>
        )}
        {modifiers.map((modifier) => (
          <button
            key={modifier}
            onClick={() => handleModifierSelect(modifier)}
            className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-[#0D0C0C]' : 'bg-[#A68477]'} ${isDarkMode ? 'text-[#F2F2F2]' : 'text-[#0D0C0C]'}`}
          >
            {capitalizeFirstLetter(modifier)}
          </button>
        ))}
        <form onSubmit={handleCustomModifierSubmit} className="p-2">
          <input
            type="text"
            value={customModifier}
            onChange={(e) => setCustomModifier(e.target.value)}
            placeholder="Custom modifier"
            className={`w-full p-1 ${isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2]' : 'bg-[#F2F2F2] text-[#0D0C0C]'} border border-[#595859] rounded`}
          />
        </form>
        {section.modifier && (
          <div className="px-4 py-2">
            {section.modifier.split(' ').filter(tag => tag.toLowerCase() !== section.content.toLowerCase()).map((tag, index) => (
              <button
                key={index}
                onClick={() => handleRemoveModifier(tag)}
                className={`inline-block px-2 py-1 m-1 text-xs rounded bg-red-500 text-white hover:bg-red-600`}
              >
                {tag} <X size={12} className="inline" />
              </button>
            ))}
          </div>
        )}
      </div>,
      document.body
    )
  );

  if (section.type === 'StructureModifier') {
    return (
      <div className={`p-2 rounded bg-[${theme.common.brown}] text-[${theme.common.white}] flex justify-between items-center w-full mb-4 relative z-10`}>
        <span>{displayLabel()}</span>
        {!isFocusMode && (
          <div className="flex space-x-2">
            <button
              ref={modifierButtonRef}
              onClick={() => setShowModifierDropdown(!showModifierDropdown)}
              className={iconButtonStyle}
            >
              <Tag size={16} />
            </button>
            <button
              onClick={() => duplicateSection(index)}
              className={iconButtonStyle}
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => moveSection(index, 'up')}
              className={`${iconButtonStyle} ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={index === 0}
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => moveSection(index, 'down')}
              className={`${iconButtonStyle} ${index === sectionsLength - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={index === sectionsLength - 1}
            >
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => removeSection(index)}
              className={iconButtonStyle}
            >
              <XCircle size={16} />
            </button>
          </div>
        )}
        {showModifierDropdown && renderModifierDropdown()}
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start relative bg-[#595859] bg-opacity-30 border-2 border-[#A68477] rounded-lg pt-1 pl-1 pr-1">
      <div className="flex-grow relative">
        <div className="flex items-center mb-1">
          <span className="font-bold text-sm mr-2">{displayLabel()}</span>
          {!isFocusMode && (
            <>
              <button
                onClick={() => setEditingSectionAt(editingSectionAt === index ? null : index)}
                className={iconButtonStyle}
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => duplicateSection(index)}
                className={iconButtonStyle}
              >
                <Copy size={16} />
              </button>
              {section.type !== 'Line' && (
                <button
                  ref={modifierButtonRef}
                  onClick={() => setShowModifierDropdown(!showModifierDropdown)}
                  className={iconButtonStyle}
                >
                  <Tag size={16} />
                </button>
              )}
              {section.type === 'Verse' && (
                <div className="flex items-center">
                  {verseNumbers.map(num => (
                    <button
                      key={num}
                      onClick={() => changeVerseNumber(index, num)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full ml-1 ${
                        section.verseNumber === num
                          ? 'bg-[#A68477] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <textarea
          placeholder={`Enter your ${section.type.toLowerCase()} lyrics here...`}
          className={`w-full p-2 border rounded ${
            isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'
          }`}
          value={section.content}
          onChange={(e) => handleSectionChange(index, e.target.value)}
          rows={6}
        ></textarea>
        {editingSectionAt === index && (
          <div className={`absolute z-50 top-6 left-0 ${isDarkMode ? 'bg-[#595859]' : 'bg-[#F2F2F2]'} border border-[#595859] rounded shadow-lg`}>
            {sectionTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  changeSectionType(index, type);
                  setEditingSectionAt(null);
                }}
                className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-[#0D0C0C]' : 'bg-[#A68477]'} ${isDarkMode ? 'text-[#F2F2F2]' : 'text-[#0D0C0C]'}`}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => {
                const customType = prompt("Enter custom section name:");
                if (customType) {
                  changeSectionType(index, customType);
                  setEditingSectionAt(null);
                }
              }}
              className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-[#0D0C0C]' : 'bg-[#A68477]'} ${isDarkMode ? 'text-[#F2F2F2]' : 'text-[#0D0C0C]'}`}
            >
              Custom Section
            </button>
          </div>
        )}
        {showModifierDropdown && renderModifierDropdown()}
      </div>
      {!isFocusMode && (
        <div className="ml-2 flex flex-col space-y-2">
          <button
            onClick={() => removeSection(index)}
            className={iconButtonStyle}
          >
            <XCircle size={20} />
          </button>
          <button
            onClick={() => moveSection(index, 'up')}
            className={`${iconButtonStyle} ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={index === 0}
          >
            <ArrowUp size={20} />
          </button>
          <button
            onClick={() => moveSection(index, 'down')}
            className={`${iconButtonStyle} ${index === sectionsLength - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={index === sectionsLength - 1}
          >
            <ArrowDown size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Section;