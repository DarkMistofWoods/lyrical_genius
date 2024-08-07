import React, { useState, useEffect, useRef } from 'react';
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
  dragHandleProps
}) {
  const [showModifierDropdown, setShowModifierDropdown] = useState(false);
  const [customModifier, setCustomModifier] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [modifierPosition, setModifierPosition] = useState('prefix');
  const [showMaxModifierWarning, setShowMaxModifierWarning] = useState(false);
  const modifierButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [showCustomSectionPrompt, setShowCustomSectionPrompt] = useState(false);
  const [customSectionName, setCustomSectionName] = useState('');

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          editingSectionAt !== null && 
          document.querySelector(`[data-section-index='${editingSectionAt}']`) &&
          !document.querySelector(`[data-section-index='${editingSectionAt}']`).contains(event.target)) {
        setEditingSectionAt(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingSectionAt]);

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
      let prefixes = Array.isArray(section.modifier?.prefix) ? [...section.modifier.prefix] : [];
      let suffixes = Array.isArray(section.modifier?.suffix) ? [...section.modifier.suffix] : [];
  
      if (prefixes.length + suffixes.length < 2) {
        if (modifierPosition === 'prefix') {
          prefixes.push(modifier);
        } else if (modifierPosition === 'suffix') {
          suffixes.push(modifier);
        }
        addModifier(index, { prefix: prefixes, suffix: suffixes });
      } else {
        setShowMaxModifierWarning(true);
        setTimeout(() => setShowMaxModifierWarning(false), 3000);
      }
    } else if (section.type === 'Verse') {
      let prefixes = Array.isArray(section.modifier?.prefix) ? [...section.modifier.prefix] : 
                     (section.modifier?.prefix ? [section.modifier.prefix] : []);
  
      if (prefixes.length < 2) {
        prefixes.push(modifier);
        addModifier(index, { prefix: prefixes });
      } else {
        setShowMaxModifierWarning(true);
        setTimeout(() => setShowMaxModifierWarning(false), 3000);
      }
    } else {
      let modifiers = typeof section.modifier === 'string' ? section.modifier.split(' ') : [];
  
      if (modifiers.length < 2) {
        modifiers.push(modifier);
        addModifier(index, modifiers.join(' '));
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

  const handleRemoveModifier = (tagToRemove) => {
    if (section.type === 'StructureModifier') {
      const newModifier = {
        prefix: Array.isArray(section.modifier?.prefix) ? section.modifier.prefix.filter(m => m !== tagToRemove) : [],
        suffix: Array.isArray(section.modifier?.suffix) ? section.modifier.suffix.filter(m => m !== tagToRemove) : []
      };
      removeModifier(index, newModifier);
    } else if (section.type === 'Verse') {
      const newPrefixes = Array.isArray(section.modifier?.prefix) 
        ? section.modifier.prefix.filter(m => m !== tagToRemove)
        : (section.modifier?.prefix && section.modifier.prefix !== tagToRemove ? [section.modifier.prefix] : []);
      removeModifier(index, { prefix: newPrefixes });
    } else {
      const currentModifiers = typeof section.modifier === 'string' ? section.modifier.split(' ') : [];
      const newModifiers = currentModifiers.filter(m => m !== tagToRemove);
      removeModifier(index, newModifiers.join(' '));
    }
  };

  const displayLabel = () => {
    if (section.type === 'StructureModifier') {
      const baseContent = capitalizeFirstLetter(section.content);
      const prefixes = Array.isArray(section.modifier?.prefix) ? section.modifier.prefix : [];
      const suffixes = Array.isArray(section.modifier?.suffix) ? section.modifier.suffix : [];
      return `${prefixes.join(' ')} ${baseContent} ${suffixes.join(' ')}`.trim();
    } else if (section.type === 'Verse') {
      const prefixes = Array.isArray(section.modifier?.prefix) ? section.modifier.prefix :
        (section.modifier?.prefix ? [section.modifier.prefix] : []);
      return `${prefixes.map(capitalizeFirstLetter).join(' ')} Verse ${section.verseNumber}`.trim();
    } else {
      const modifiers = typeof section.modifier === 'string' ? section.modifier.split(' ') :
        (Array.isArray(section.modifier) ? section.modifier : []);
      const baseLabel = section.type;
      return `${modifiers.map(capitalizeFirstLetter).join(' ')} ${baseLabel}`.trim();
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
        {section.type === 'StructureModifier' && section.modifier && (
          <div className="px-4 py-2">
            {[...(Array.isArray(section.modifier.prefix) ? section.modifier.prefix : []), 
              ...(Array.isArray(section.modifier.suffix) ? section.modifier.suffix : [])].map((tag, index) => (
              <button
                key={index}
                onClick={() => handleRemoveModifier(tag)}
                className={`inline-block px-2 py-1 m-1 text-xs rounded bg-[${theme.common.brown}] text-white hover:bg-red-600`}
              >
                {tag} <X size={12} className="inline" />
              </button>
            ))}
          </div>
        )}
        {section.type === 'Verse' && section.modifier && (
          <div className="px-4 py-2">
            {(Array.isArray(section.modifier.prefix) ? section.modifier.prefix : 
              (section.modifier.prefix ? [section.modifier.prefix] : [])).map((prefix, index) => (
              <button
                key={index}
                onClick={() => handleRemoveModifier(prefix)}
                className={`inline-block px-2 py-1 m-1 text-xs rounded bg-[${theme.common.brown}] text-white hover:bg-red-600`}
              >
                {prefix} <X size={12} className="inline" />
              </button>
            ))}
          </div>
        )}
        {section.type !== 'StructureModifier' && section.type !== 'Verse' && section.modifier && (
          <div className="px-4 py-2">
            {(typeof section.modifier === 'string' ? section.modifier.split(' ') : []).map((tag, index) => (
              <button
                key={index}
                onClick={() => handleRemoveModifier(tag)}
                className={`inline-block px-2 py-1 m-1 text-xs rounded bg-[${theme.common.brown}] text-white hover:bg-red-600`}
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
            <div {...dragHandleProps} className={`${iconButtonStyle} cursor-move`}>
              <GripVertical size={16} />
            </div>
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
    <div data-section-index={index} className="mb-4 flex flex-col relative bg-[#595859] bg-opacity-30 border-2 border-[#A68477] rounded-lg p-1">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center">
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
                      className={`w-6 h-6 flex items-center justify-center rounded-full ml-1 ${section.verseNumber === num
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
        {!isFocusMode && (
          <div className="flex items-center">
            <div {...dragHandleProps} className={`${iconButtonStyle} cursor-move mr-1`}>
              <GripVertical size={16} />
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
          placeholder={`Enter your ${section.type.toLowerCase()} lyrics here...`}
          className={`w-full p-2 pr-8 border rounded ${isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'
            }`}
          value={section.content}
          onChange={(e) => handleSectionChange(index, e.target.value)}
          rows={6}
        ></textarea>
      </div>
      {showMaxModifierWarning && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-red-500 text-white px-2 py-1 rounded text-sm flex items-center z-50">
          <AlertCircle size={16} className="mr-1" />
          Max modifiers reached (2)
        </div>
      )}
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