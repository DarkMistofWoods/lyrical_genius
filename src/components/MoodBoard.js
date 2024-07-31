import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateElementPosition, removeElement, updateElementSize, updateElementContent, updateElementRotation } from '../store/moodBoardSlice';
import theme from '../theme';
import { Maximize2, X, RotateCw, Edit2, Bold, Italic, Underline } from 'lucide-react';

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
        const degrees = angle * (180 / Math.PI);
        
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
    if (isEditing && !isEditingText) {
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

  const handleRemove = () => {
    dispatch(removeElement(element.id));
  };

  const handleDoubleClick = () => {
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

  const currentMoodBoard = moodBoards.find(board => board.id === currentMoodBoardId);

  const handleStartEditing = (element) => {
    setEditingElement(element);
  };

  const handleSelectElement = (elementId) => {
    setSelectedElementId(elementId);
  };

  if (!isVisible || !currentMoodBoard) return null;

  return (
    <div 
      className={`fixed inset-0 ${isEditing ? 'z-40' : 'z-0'} transition-opacity duration-300`}
      style={{
        backgroundColor: isDarkMode ? theme.dark.background : theme.light.background,
        opacity: isEditing ? 1 : 0.1,
      }}
    >
      <h2 className={`text-2xl font-bold m-4 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
        {currentMoodBoard.name}
      </h2>
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
    </div>
  );
};

export default MoodBoard;