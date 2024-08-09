import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const DropdownPortal = ({ children, buttonRef, isOpen, onClose, position = 'bottom' }) => {
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const button = buttonRef.current;
      const dropdown = dropdownRef.current;
      if (!button || !dropdown) return;

      const buttonRect = button.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top, left;

      if (position === 'top' || (position === 'bottom' && buttonRect.bottom + dropdownRect.height > viewportHeight)) {
        // Position above the button
        top = Math.max(0, buttonRect.top - dropdownRect.height);
      } else if (position === 'bottom-left') {
        // Position below the button, aligned with its left edge
        top = buttonRect.bottom;
        left = buttonRect.left;
      } else {
        // Position below the button
        top = buttonRect.bottom;
      }

      if (position !== 'bottom-left') {
        // Center align the dropdown
        left = buttonRect.left + (buttonRect.width / 2) - (dropdownRect.width / 2);
      }

      // Ensure the dropdown doesn't extend past the right edge of the viewport
      const rightEdge = left + dropdownRect.width;
      if (rightEdge > viewportWidth) {
        left = Math.max(0, viewportWidth - dropdownRect.width);
      }

      setDropdownPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, buttonRef, position]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, buttonRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-50"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;