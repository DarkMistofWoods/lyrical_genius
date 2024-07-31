import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateElementPosition, removeElement, updateElementSize, updateElementContent } from '../store/moodBoardSlice';
import theme from '../theme';
import { Maximize2, X, Edit2, Bold, Italic, Underline } from 'lucide-react';

const MoodBoardElement = ({ element, isEditing, onStartEditing }) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedContent, setEditedContent] = useState(element.content);
  const elementRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && isEditing) {
        dispatch(updateElementPosition({
          id: element.id,
          position: {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          },
        }));
      } else if (isResizing && isEditing) {
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
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dispatch, dragOffset, element.id, isEditing, initialMousePos, initialSize]);

  const handleMouseDown = (e) => {
    if (isEditing && !isEditingText) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - element.position.x,
        y: e.clientY - element.position.y,
      });
    }
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    if (isEditing) {
      setIsResizing(true);
      setInitialMousePos({ x: e.clientX, y: e.clientY });
      setInitialSize({
        width: elementRef.current.offsetWidth,
        height: elementRef.current.offsetHeight,
      });
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
      className={`absolute ${isEditing ? 'cursor-move' : 'cursor-default'} select-none`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: element.size?.width || 'auto',
        height: element.size?.height || 'auto',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {element.type === 'text' && !isEditingText && (
        <p
          className="w-full h-full break-words overflow-hidden"
          style={{
            ...element.style,
            fontSize: `${element.style.fontSize}px`,
          }}
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
          style={{
            ...element.style,
            fontSize: `${element.style.fontSize}px`,
          }}
        />
      )}
      {element.type === 'image' && (
        <img
          src={element.content}
          alt="Mood board element"
          className="w-full h-full object-cover"
        />
      )}
      {isEditing && (
        <>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 size={16} className="text-white" />
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
  
    const currentMoodBoard = moodBoards.find(board => board.id === currentMoodBoardId);
  
    const handleStartEditing = (element) => {
      setEditingElement(element);
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
          />
        ))}
      </div>
    );
  };

export default MoodBoard;