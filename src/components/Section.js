import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { Settings, Copy, XCircle, Tag, X, AlertCircle, GripVertical } from 'lucide-react';
import theme from '../theme';
import { capitalizeFirstLetter } from '../utils/helpers';

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
  handleSectionChange,
  sectionsLength,
  changeSectionType,
  addModifier,
  removeModifier,
  isFocusMode,
  dragHandleProps, 
  isMobile,
  sectionsLoaded  // Add this line
}) {
  const [customModifier, setCustomModifier] = useState('');
  const [showMaxModifierWarning, setShowMaxModifierWarning] = useState(false);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [showCustomSectionPrompt, setShowCustomSectionPrompt] = useState(false);
  const [customSectionName, setCustomSectionName] = useState('');
  const [localContent, setLocalContent] = useState(section.content);
  const textareaRef = useRef(null);
  const [isSettingsDropdownVisible, setIsSettingsDropdownVisible] = useState(false);
  const [settingsDropdownPosition, setSettingsDropdownPosition] = useState({ top: 0, left: 0 });
  const [showModifierDropdown, setShowModifierDropdown] = useState(false);
  const [isModifierDropdownVisible, setIsModifierDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const settingsButtonRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const modifierButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  // console.log(`Section ${index} type:`, section.type);
  // console.log(`Section ${index} modifier:`, section.modifier);

  const iconButtonStyle = `
    w-8 h-8 
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
    ${isMobile ? 'text-xl' : ''}
  `;

  useEffect(() => {
    function updateDropdownPosition() {
      if (showModifierDropdown && modifierButtonRef.current && dropdownRef.current) {
        const buttonRect = modifierButtonRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top = buttonRect.bottom;
        let left = buttonRect.left;

        // Position above the button if there's not enough space below
        if (top + dropdownRect.height > viewportHeight) {
          top = Math.max(0, buttonRect.top - dropdownRect.height);
        }

        // Ensure the dropdown doesn't extend past the right edge of the viewport
        if (left + dropdownRect.width > viewportWidth) {
          left = Math.max(0, viewportWidth - dropdownRect.width);
        }

        setDropdownPosition({ top, left });
        // Only show the dropdown after position is calculated
        setTimeout(() => setIsModifierDropdownVisible(true), 0);
      }
    }

    if (showModifierDropdown) {
      updateDropdownPosition();
    }

    window.addEventListener('scroll', updateDropdownPosition);
    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showModifierDropdown]);

  useEffect(() => {
    setLocalContent(section.content);
  }, [section.content]);

  const handleLocalChange = (e) => {
    setLocalContent(e.target.value);
    adjustTextareaHeight();
  };

  const handleBlur = useCallback(() => {
    if (localContent !== section.content) {
      handleSectionChange(index, localContent);
    }
  }, [index, localContent, section.content, handleSectionChange]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset the height to auto
      textarea.style.height = 'auto';
      // Set the height to the scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;
      // If it's mobile and the content is empty, set a minimum height
      if (isMobile && !textarea.value.trim()) {
        textarea.style.height = '100px';
      }
    }
  }, [isMobile]);

  useEffect(() => {
    if (sectionsLoaded) {
      adjustTextareaHeight();
    }
  }, [localContent, adjustTextareaHeight, isMobile, sectionsLoaded]);

  useEffect(() => {
    function handleClickOutside(event) {
      // Handle click outside for modifier dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          !modifierButtonRef.current.contains(event.target)) {
        setShowModifierDropdown(false);
      }
      
      // Handle click outside for settings dropdown
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target) &&
          editingSectionAt !== null && 
          !settingsButtonRef.current.contains(event.target)) {
        setEditingSectionAt(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingSectionAt, setEditingSectionAt]);

  const handleSettingsButtonClick = (e) => {
    e.stopPropagation();
    const newEditingSectionAt = editingSectionAt === index ? null : index;
    setEditingSectionAt(newEditingSectionAt);
    setIsSettingsDropdownVisible(false);  // Hide dropdown initially
  };

  useEffect(() => {
    function updateSettingsDropdownPosition() {
      if (editingSectionAt === index && settingsButtonRef.current && settingsDropdownRef.current) {
        const buttonRect = settingsButtonRef.current.getBoundingClientRect();
        const dropdownRect = settingsDropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top = buttonRect.top + 25;
        let left = buttonRect.left;

        // Ensure the dropdown doesn't extend past the bottom of the viewport
        if (top + dropdownRect.height > viewportHeight) {
          top = Math.max(0, viewportHeight - dropdownRect.height);
        }

        // Ensure the dropdown doesn't extend past the right edge of the viewport
        if (left + dropdownRect.width > viewportWidth) {
          left = Math.max(0, viewportWidth - dropdownRect.width);
        }

        setSettingsDropdownPosition({ top, left });
        setIsSettingsDropdownVisible(true);
      }
    }

    if (editingSectionAt === index) {
      updateSettingsDropdownPosition();
    }

    window.addEventListener('scroll', updateSettingsDropdownPosition);
    window.addEventListener('resize', updateSettingsDropdownPosition);

    return () => {
      window.removeEventListener('scroll', updateSettingsDropdownPosition);
      window.removeEventListener('resize', updateSettingsDropdownPosition);
    };
  }, [editingSectionAt, index]);

  const handleCustomSectionSubmit = (e) => {
    e.preventDefault();
    if (customSectionName.trim()) {
      changeSectionType(index, customSectionName.trim());
      setShowCustomSectionPrompt(false);
      setCustomSectionName('');
      setEditingSectionAt(null);
    }
  };

  const handleModifierSelect = (modifier) => {
    modifier = capitalizeFirstLetter(modifier);
  
    if (section.type === 'StructureModifier') {
      let prefixes = Array.isArray(section.modifier) ? [...section.modifier] : [];
  
      if (prefixes.length < 2) {
        prefixes.unshift(modifier); // Add new modifier to the beginning for StructureModifier
        addModifier(index, prefixes);
      } else {
        setShowMaxModifierWarning(true);
        setTimeout(() => setShowMaxModifierWarning(false), 3000);
      }
    } else if (section.type === 'Verse') {
      let prefixes = Array.isArray(section.modifier) ? [...section.modifier] : [];
  
      if (prefixes.length < 2) {
        prefixes.unshift(modifier); // Add new modifier to the beginning for Verse
        addModifier(index, prefixes);
      } else {
        setShowMaxModifierWarning(true);
        setTimeout(() => setShowMaxModifierWarning(false), 3000);
      }
    } else {
      let modifiers = Array.isArray(section.modifier) ? [...section.modifier] : [];
  
      if (modifiers.length < 2) {
        modifiers.unshift(modifier); // Add new modifier to the end for other section types
        addModifier(index, modifiers);
      } else {
        setShowMaxModifierWarning(true);
        setTimeout(() => setShowMaxModifierWarning(false), 3000);
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

  const handleModifierButtonClick = () => {
    setShowModifierDropdown(!showModifierDropdown);
    setIsModifierDropdownVisible(false);  // Hide dropdown initially
  };

  const handleRemoveModifier = (tagToRemove) => {
    if (section.type === 'StructureModifier' || section.type === 'Verse') {
      const newModifiers = Array.isArray(section.modifier) 
        ? section.modifier.filter(m => m !== tagToRemove)
        : [];
      removeModifier(index, newModifiers);
    } else {
      const newModifiers = Array.isArray(section.modifier) 
        ? section.modifier.filter(m => m !== tagToRemove)
        : [];
      removeModifier(index, newModifiers);
    }
  };

  const displayLabel = () => {
    if (section.type === 'StructureModifier') {
      const baseContent = capitalizeFirstLetter(section.content);
      const modifiers = Array.isArray(section.modifier) ? section.modifier : [];
      return `${modifiers.join(' ')} ${baseContent}`.trim();
    } else if (section.type === 'Verse') {
      const modifiers = Array.isArray(section.modifier) ? section.modifier : [];
      return `${modifiers.map(capitalizeFirstLetter).join(' ')} Verse ${section.verseNumber}`.trim();
    } else {
      const modifiers = Array.isArray(section.modifier) ? section.modifier : [];
      const baseLabel = section.type;
      return `${modifiers.map(capitalizeFirstLetter).join(' ')} ${baseLabel}`.trim();
    }
  };

  const renderModifierDropdown = () => (
    ReactDOM.createPortal(
      <div 
        ref={dropdownRef}
        className={`fixed z-50 ${isDarkMode ? 'bg-[#595859]' : 'bg-[#F2F2F2]'} border border-[#595859] rounded shadow-lg ${isModifierDropdownVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          top: `${dropdownPosition.top}px`, 
          left: `${dropdownPosition.left}px`,
          transition: 'opacity 0.2s ease-in-out'
        }}
      >
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
            {Array.isArray(section.modifier) ? section.modifier.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleRemoveModifier(tag)}
                className={`inline-block px-2 py-1 m-1 text-xs rounded bg-[${theme.common.brown}] text-white hover:bg-red-600`}
              >
                {tag} <X size={12} className="inline" />
              </button>
            )) : null}
          </div>
        )}
      </div>,
      document.body
    )
  );

  const renderMobileButtons = () => (
    <div className="flex flex-wrap justify-center items-center mt-2 mb-1">
      <button
        ref={settingsButtonRef}
        onClick={handleSettingsButtonClick}
        className={iconButtonStyle}
      >
        <Settings size={20} />
      </button>
      <button
        onClick={() => duplicateSection(index)}
        className={iconButtonStyle}
      >
        <Copy size={20} />
      </button>
      {section.type !== 'Line' && (
        <button
          ref={modifierButtonRef}
          onClick={handleModifierButtonClick}
          className={iconButtonStyle}
        >
          <Tag size={20} />
        </button>
      )}
      <div {...dragHandleProps} className={`${iconButtonStyle} cursor-move`}>
        <GripVertical size={20} />
      </div>
      <button
        onClick={() => removeSection(index)}
        className={iconButtonStyle}
      >
        <XCircle size={20} />
      </button>
      {section.type === 'Verse' && (
        <div className="flex items-center mt-2">
          {verseNumbers.map(num => (
            <button
              key={num}
              onClick={() => changeVerseNumber(index, num)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ml-1 ${
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
    </div>
  );

  if (section.type === 'StructureModifier') {
    return (
      <div className={`p-2 rounded bg-[${theme.common.brown}] text-[${theme.common.white}] flex ${isMobile ? 'flex-col' : 'justify-between items-center'} w-full mb-4 relative z-10`}>
        <span className={`${isMobile ? 'm-auto' : ''} font-bold`}>{displayLabel()}</span>
        {!isFocusMode && (
          <div className={`flex ${isMobile ? 'flex-wrap justify-center' : 'space-x-2'}`}>
            {isMobile ? renderMobileButtons() : (
              <>
                <button
                  ref={modifierButtonRef}
                  onClick={() => setShowModifierDropdown(!showModifierDropdown)}
                  className={iconButtonStyle}
                >
                  <Tag size={20} />
                </button>
                <button
                  onClick={() => duplicateSection(index)}
                  className={iconButtonStyle}
                >
                  <Copy size={20} />
                </button>
                <div {...dragHandleProps} className={`${iconButtonStyle} cursor-move`}>
                  <GripVertical size={20} />
                </div>
                <button
                  onClick={() => removeSection(index)}
                  className={iconButtonStyle}
                >
                  <XCircle size={20} />
                </button>
              </>
            )}
          </div>
        )}
        {showModifierDropdown && renderModifierDropdown()}
      </div>
    );
  }

  return (
    <div data-section-index={index} className={`mb-4 flex flex-col relative bg-[#595859] bg-opacity-30 border-2 border-[#A68477] rounded-lg p-2 ${isMobile ? 'p-3' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-between items-start'} mb-2`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-center'}`}>
          <span className={`font-bold ${isMobile ? 'text-lg m-auto' : 'mr-2'}`}>{displayLabel()}</span>
          {!isFocusMode && !isMobile && (
            <>
              <button
                ref={settingsButtonRef}
                onClick={handleSettingsButtonClick}
                className={iconButtonStyle}
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => duplicateSection(index)}
                className={iconButtonStyle}
              >
                <Copy size={20} />
              </button>
              {section.type !== 'Line' && (
                <button
                  ref={modifierButtonRef}
                  onClick={handleModifierButtonClick}
                  className={iconButtonStyle}
                >
                  <Tag size={20} />
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
        {!isFocusMode && isMobile && renderMobileButtons()}
        {!isFocusMode && !isMobile && (
          <div className="flex items-center">
            <div {...dragHandleProps} className={`${iconButtonStyle} cursor-move mr-1`}>
              <GripVertical size={20} />
            </div>
            <button
              onClick={() => removeSection(index)}
              className={iconButtonStyle}
            >
              <XCircle size={20} />
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          placeholder={`Enter your ${section.type.toLowerCase()} lyrics here...`}
          className={`w-full p-2 pr-8 border rounded resize-none overflow-hidden ${isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'
            } ${isMobile ? 'text-base' : ''}`}
          value={localContent}
          onChange={handleLocalChange}
          onBlur={handleBlur}
          style={{ minHeight: isMobile ? '100px' : '24px' }}
        ></textarea>
      </div>
      {showMaxModifierWarning && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-red-500 text-white px-2 py-1 rounded text-sm flex items-center z-50">
          <AlertCircle size={16} className="mr-1" />
          Max modifiers reached (2)
        </div>
      )}
      {editingSectionAt === index && (
        <div 
          ref={settingsDropdownRef}
          className={`fixed z-50 ${isDarkMode ? 'bg-[#595859]' : 'bg-[#F2F2F2]'} border border-[#595859] rounded shadow-lg ${isSettingsDropdownVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{
            top: `${settingsDropdownPosition.top}px`,
            left: `${settingsDropdownPosition.left}px`,
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
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
            onClick={() => setShowCustomSectionPrompt(true)}
            className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-[#0D0C0C]' : 'bg-[#A68477]'} ${isDarkMode ? 'text-[#F2F2F2]' : 'text-[#0D0C0C]'}`}
          >
            Custom Section
          </button>
        </div>
      )}
      {showCustomSectionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <h2 className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] text-xl font-bold mb-4`}>
              Add Custom Section
            </h2>
            <form onSubmit={handleCustomSectionSubmit}>
              <input
                type="text"
                value={customSectionName}
                onChange={(e) => setCustomSectionName(e.target.value)}
                placeholder="Enter custom section name"
                className={`w-full p-2 mb-4 border rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomSectionPrompt(false);
                    setCustomSectionName('');
                    setEditingSectionAt(null);
                  }}
                  className={`px-4 py-2 rounded bg-[${theme.common.grey}] text-[${theme.common.white}] hover:opacity-80`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded bg-[${theme.common.brown}] text-[${theme.common.white}] hover:opacity-80`}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showModifierDropdown && renderModifierDropdown()}
    </div>
  );
}

export default Section;