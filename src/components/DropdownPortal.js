import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const DropdownPortal = ({ children, buttonRef, isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const button = buttonRef.current;
      const dropdown = dropdownRef.current;
      if (!button || !dropdown) return;

      const buttonRect = button.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const dropdownHeight = dropdown.offsetHeight;

      let top;
      if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
        top = buttonRect.bottom;
      } else {
        top = buttonRect.top - dropdownHeight;
      }

      setPosition({
        top: top,
        left: buttonRect.left,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, buttonRef, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: buttonRef.current ? buttonRef.current.offsetWidth : 'auto'
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;