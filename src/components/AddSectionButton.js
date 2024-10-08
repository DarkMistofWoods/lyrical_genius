import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Plus, X } from 'lucide-react';
import DropdownPortal from './DropdownPortal';
import CategorizedDropdown from './CategorizedDropdown';
import theme from '../theme';

function AddSectionButton({ index, isAdding, setAddingSectionAt, addSection }) {
  const buttonRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [isCustomPromptVisible, setIsCustomPromptVisible] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customName, setCustomName] = useState('');
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  useEffect(() => {
    if (isAdding) {
      const timer = setTimeout(() => {
        setShowDropdown(true);
        // Delay setting visibility to allow for position calculation
        setTimeout(() => setIsDropdownVisible(true), 50);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowDropdown(false);
      setIsDropdownVisible(false);
    }
  }, [isAdding]);

  const handleAddCustomSection = (category) => {
    setCustomCategory(category);
    setShowCustomPrompt(true);
    setShowDropdown(false);
    // Delay setting visibility to allow for position calculation
    setTimeout(() => setIsCustomPromptVisible(true), 50);
  };

  const handleCustomSubmit = (event) => {
    event.preventDefault();
    if (customName.trim()) {
      addSection(customCategory, customName.trim(), index);
      setShowCustomPrompt(false);
      setIsCustomPromptVisible(false);
      setCustomName('');
      setAddingSectionAt(null);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setAddingSectionAt(isAdding ? null : index)}
        className={`addSectionButton absolute z-10 transform -translate-x-1/2 bg-transparent border-2 border-[#A68477] rounded-lg p-1 mt-1 hover:opacity-60`}
        style={{ top: '-10px', left: '50%' }}
      >
        <Plus size={16} className={`text-[${theme.common.brown}]`} />
      </button>
      {showDropdown && (
        <DropdownPortal
          isOpen={isAdding}
          buttonRef={buttonRef}
          onClose={() => {
            setAddingSectionAt(null);
            setIsDropdownVisible(false);
          }}
          position="bottom-left"
        >
          <div className={`transition-opacity duration-200 ${isDropdownVisible ? 'opacity-100' : 'opacity-0'}`}>
            <CategorizedDropdown
              onSelect={(category, item) => {
                if (item === 'Custom') {
                  handleAddCustomSection(category);
                } else {
                  addSection(category, item, index);
                }
              }}
              isDarkMode={isDarkMode}
              buttonRef={buttonRef}
            />
          </div>
        </DropdownPortal>
      )}
      {showCustomPrompt && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200 ${isCustomPromptVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <h2 className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] text-xl font-bold mb-4`}>
              Add Custom {customCategory === 'Lyric Sections' ? 'Section' : 'Modifier'}
            </h2>
            <form onSubmit={handleCustomSubmit}>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Enter custom ${customCategory === 'Lyric Sections' ? 'section' : 'modifier'} name`}
                className={`w-full p-2 mb-4 border rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomPrompt(false);
                    setIsCustomPromptVisible(false);
                    setCustomName('');
                    setAddingSectionAt(null);
                  }}
                  className={`px-4 py-2 rounded bg-[${theme.common.grey}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] hover:opacity-80`}
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
    </div>
  );
}

export default AddSectionButton;