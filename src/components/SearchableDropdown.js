import React, { useState, useEffect, useRef } from 'react';
import theme from '../theme';

function SearchableDropdown({ label, options, selectedValues, onChange, labelColor }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const sortedOptions = [...options].sort((a, b) => a.value.localeCompare(b.value));

  const filteredOptions = sortedOptions.filter(option =>
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className={`block text-sm font-medium mb-1`} style={{ color: labelColor }}>{label}</label>
      <div className="relative">
        <button
          type="button"
          className={`w-full bg-[${theme.common.white}] border border-gray-300 rounded-md py-2 px-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[${theme.common.black}]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : 'Select options'}
        </button>
        {isOpen && (
          <div className={`absolute z-[9999] mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm`}>
            <input
              type="text"
              className={`block w-full px-4 py-2 border-b text-[${theme.common.black}]`}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`${
                  selectedValues.includes(option.value) ? 'bg-blue-100' : ''
                } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-[${theme.common.black}]`}
                onClick={() => toggleOption(option.value)}
              >
                {capitalizeFirstLetter(option.value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchableDropdown;