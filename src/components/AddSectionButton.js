import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import DropdownPortal from './DropdownPortal';
import CategorizedDropdown from './CategorizedDropdown';
import theme from '../theme';

function AddSectionButton({ index, isAdding, setAddingSectionAt, addSection }) {
  const buttonRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  useEffect(() => {
    if (isAdding) {
      const timer = setTimeout(() => setShowDropdown(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowDropdown(false);
    }
  }, [isAdding]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setAddingSectionAt(isAdding ? null : index)}
        className={`absolute z-10 transform -translate-x-1/2 bg-[${theme.common.brown}] rounded-full p-1 hover:opacity-80`}
        style={{ top: '-10px', left: '50%' }}
      >
        <Plus size={16} className={`text-[${theme.common.white}]`} />
      </button>
      {showDropdown && (
        <DropdownPortal
          isOpen={isAdding}
          buttonRef={buttonRef}
          onClose={() => setAddingSectionAt(null)}
        >
          <CategorizedDropdown
            onSelect={(category, item) => addSection(category, item, index)}
            isDarkMode={isDarkMode}
          />
        </DropdownPortal>
      )}
    </div>
  );
}

export default AddSectionButton;