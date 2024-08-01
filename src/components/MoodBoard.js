import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateElementPosition, removeElement, updateElementSize, updateElementContent, updateElementRotation, updateBackground, updateOpacity, updateGradientAngle } from '../store/moodBoardSlice';
import theme from '../theme';
import { Maximize2, X, RotateCw, Edit2, Bold, Italic, Underline, ChevronUp, ChevronDown, Settings } from 'lucide-react';

const MoodBoardElement = ({ element, isEditing, onStartEditing, isSelected, onSelect }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedContent, setEditedContent] = useState(element.content);
  const elementRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && isEditing && isSelected) {
        dispatch(updateElementPosition({
          id: element.id,
          position: {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          },
        }));
      } else if (isResizing && isEditing && isSelected) {
        const dx = e.clientX - initialMousePos.x;
        const dy = e.clientY - initialMousePos.y;
        let newWidth, newHeight;

        if (element.type === 'image') {
          const aspectRatio = initialSize.width / initialSize.height;
          newWidth = initialSize.width + dx;
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = initialSize.width + dx;
          newHeight = initialSize.height + dy;
        }

        dispatch(updateElementSize({
          id: element.id,
          size: {
            width: Math.max(newWidth, 20),
            height: Math.max(newHeight, 20),
          },
        }));
      } else if (isRotating && isEditing && isSelected) {
        const elementRect = elementRef.current.getBoundingClientRect();
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;
        
        const angle = Math.atan2(e.clientY - elementCenterY, e.clientX - elementCenterX);
        let degrees = angle * (180 / Math.PI);
        
        // Snap to 15-degree increments
        degrees = Math.round(degrees / 15) * 15;
        
        dispatch(updateElementRotation({
          id: element.id,
          rotation: degrees,
        }));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, dispatch, dragOffset, element.id, isEditing, initialMousePos, initialSize, isSelected]);

  const handleMouseDown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to the MoodBoard
    if (isEditing) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - element.position.x,
        y: e.clientY - element.position.y,
      });
      onSelect(element.id);
    }
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    if (isEditing && isSelected) {
      setIsResizing(true);
      setInitialMousePos({ x: e.clientX, y: e.clientY });
      setInitialSize({
        width: elementRef.current.offsetWidth,
        height: elementRef.current.offsetHeight,
      });
    }
  };

  const handleRotateStart = (e) => {
    e.stopPropagation();
    if (isEditing && isSelected) {
      setIsRotating(true);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    dispatch(removeElement(element.id));
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditing && element.type === 'text') {
      setIsEditingText(true);
      onStartEditing(element);
    }
  };

  const textStyle = {
    fontWeight: element.style?.bold ? 'bold' : 'normal',
    fontStyle: element.style?.italic ? 'italic' : 'normal',
    textDecoration: element.style?.underline ? 'underline' : 'none',
    color: element.style?.color || '#000000',
    fontSize: `${element.style?.fontSize || 16}px`,
  };

  const handleTextChange = (e) => {
    setEditedContent(e.target.value);
  };

  const handleTextBlur = () => {
    setIsEditingText(false);
    dispatch(updateElementContent({
      id: element.id,
      content: editedContent,
    }));
  };

  useEffect(() => {
    if (isEditingText && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditingText]);

  return (
    <div
      ref={elementRef}
      className={`absolute ${isEditing ? 'cursor-move' : 'cursor-default'} select-none ${isSelected ? 'border-2 border-blue-500' : ''}`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: element.size?.width || 'auto',
        height: element.size?.height || 'auto',
        transform: `rotate(${element.rotation || 0}deg)`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {element.type === 'text' && !isEditingText && (
        <p
          className="w-full h-full break-words overflow-hidden"
          style={textStyle}
        >
          {element.content}
        </p>
      )}
      {element.type === 'text' && isEditingText && (
        <textarea
          ref={textAreaRef}
          value={editedContent}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          className="w-full h-full p-0 border-none resize-none bg-transparent"
          style={textStyle}
        />
      )}
      {element.type === 'image' && (
        <img
          src={element.content}
          alt="Mood board element"
          className="w-full h-full object-cover"
        />
      )}
      {isEditing && isSelected && (
        <>
          <button
            onClick={handleRemove}
            className={`absolute -top-2 -right-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded-full w-6 h-6 flex items-center justify-center hover:bg-[${isDarkMode ? theme.dark.background : theme.light.background}] hover:text-[${theme.common.brown}] transition-colors`}
          >
            <X size={16} />
          </button>
          <div
            className={`absolute -bottom-2 -right-2 bg-[${theme.common.brown}] rounded-full w-6 h-6 cursor-se-resize flex items-center justify-center`}
            onMouseDown={handleResizeStart}
          >
            <Maximize2 size={16} className={`text-[${theme.common.white}]`} />
          </div>
          <div
            className={`absolute -top-2 -left-2 bg-[${theme.common.brown}] rounded-full w-6 h-6 cursor-pointer flex items-center justify-center`}
            onMouseDown={handleRotateStart}
          >
            <RotateCw size={16} className={`text-[${theme.common.white}]`} />
          </div>
        </>
      )}
    </div>
  );
};

const MoodBoard = ({ isVisible, isEditing }) => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { moodBoards, currentMoodBoardId } = useSelector(state => state.moodBoard);
  const [editingElement, setEditingElement] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const dispatch = useDispatch();

  const currentMoodBoard = moodBoards.find(board => board.id === currentMoodBoardId) || {
    background: { type: 'none', color: '#ffffff', gradient: { color1: '#ffffff', color2: '#000000', angle: 45 } },
    opacity: 0.1,
    elements: []
  };

  useEffect(() => {
    // Hide other sections when entering edit mode
    const mainContent = document.querySelector('main');
    const sidebar = document.querySelector('.sidebar');
    const preview = document.querySelector('.preview');

    if (mainContent && sidebar && preview) {
      if (isEditing) {
        mainContent.style.display = 'none';
        sidebar.style.display = 'none';
        preview.style.display = 'none';
      } else {
        mainContent.style.display = '';
        sidebar.style.display = '';
        preview.style.display = '';
      }
    }
  }, [isEditing]);

  const handleStartEditing = (element) => {
    setEditingElement(element);
  };

  const handleSelectElement = (elementId) => {
    setSelectedElementId(elementId);
  };

  const handleBoardClick = (e) => {
    // Only deselect if clicking directly on the board, not on an element
    if (e.target === e.currentTarget && isEditing) {
      setSelectedElementId(null);
    }
  };

  useEffect(() => {
    if (!isEditing) {
      setSelectedElementId(null);
    }
  }, [isEditing]);

  const handleBackgroundTypeChange = (type) => {
    dispatch(updateBackground({ type }));
  };

  const handleBackgroundColorChange = (color) => {
    dispatch(updateBackground({ color }));
  };

  const handleGradientColorChange = (colorKey, color) => {
    dispatch(updateBackground({ gradient: { [colorKey]: color } }));
  };

  const handleOpacityChange = (opacity) => {
    dispatch(updateOpacity(opacity));
  };

  const handleGradientAngleChange = (angle) => {
    dispatch(updateGradientAngle(angle));
  };

  if (!isVisible) return null;

  const backgroundStyle = {
    backgroundColor: currentMoodBoard.background?.type === 'solid' ? currentMoodBoard.background.color : 'transparent',
    backgroundImage: currentMoodBoard.background?.type === 'gradient' && currentMoodBoard.background.gradient
      ? `linear-gradient(${currentMoodBoard.background.gradient.angle || 45}deg, ${currentMoodBoard.background.gradient.color1 || '#ffffff'}, ${currentMoodBoard.background.gradient.color2 || '#000000'})`
      : 'none',
  };

  const opacityStyle = {
    opacity: isEditing ? 1 : (currentMoodBoard.opacity ?? 0.1),
  };

  return (
    <div 
      className={`fixed inset-0 ${isEditing ? 'z-40' : 'z-0'} transition-opacity duration-300`}
      style={currentMoodBoard.background?.type !== 'none' ? { ...backgroundStyle, ...opacityStyle } : opacityStyle}
      onClick={handleBoardClick}
    >
      {currentMoodBoard.background?.type === 'none' && (
        <div 
          className={`absolute inset-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}]`} 
          style={opacityStyle}
        ></div>
      )}
      {currentMoodBoard.elements.map(element => (
        <MoodBoardElement 
          key={element.id} 
          element={element} 
          isEditing={isEditing} 
          onStartEditing={handleStartEditing}
          isSelected={selectedElementId === element.id}
          onSelect={handleSelectElement}
        />
      ))}
      {isEditing && (
        <div className={`absolute top-4 left-4 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-4 rounded-lg shadow-lg transition-all duration-300 ${isPanelMinimized ? 'w-12 h-12 overflow-hidden' : 'w-72'} z-50`}>
          <button
            onClick={() => setIsPanelMinimized(!isPanelMinimized)}
            className={`absolute top-2 right-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
          >
            {isPanelMinimized ? <Settings size={32} /> : <X size={32} />}
          </button>
          {!isPanelMinimized && (
            <>
              <h3 className={`text-lg font-bold mb-4 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Mood Board Settings</h3>
              <div className="mb-4">
                <label className={`block mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Background Type</label>
                <select
                  value={currentMoodBoard.background?.type || 'none'}
                  onChange={(e) => handleBackgroundTypeChange(e.target.value)}
                  className={`w-full p-2 rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
                >
                  <option value="none">None</option>
                  <option value="solid">Solid Color</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>
              {currentMoodBoard.background?.type === 'solid' && (
                <div className="mb-4">
                  <label className={`block mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Background Color</label>
                  <input
                    type="color"
                    value={currentMoodBoard.background.color || '#ffffff'}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
              {currentMoodBoard.background?.type === 'gradient' && (
                <>
                  <div className="mb-4">
                    <label className={`block mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Gradient Color 1</label>
                    <input
                      type="color"
                      value={currentMoodBoard.background.gradient?.color1 || '#ffffff'}
                      onChange={(e) => handleGradientColorChange('color1', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className={`block mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Gradient Color 2</label>
                    <input
                      type="color"
                      value={currentMoodBoard.background.gradient?.color2 || '#000000'}
                      onChange={(e) => handleGradientColorChange('color2', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className={`block mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Gradient Angle</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={currentMoodBoard.background.gradient?.angle || 45}
                      onChange={(e) => handleGradientAngleChange(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>{currentMoodBoard.background.gradient?.angle || 45}°</span>
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className={`block mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>Opacity (when not editing)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentMoodBoard.opacity || 0.1}
                  onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>{currentMoodBoard.opacity || 0.1}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodBoard;