import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Undo, Wrench, MessageSquare, Sparkle, GitBranch, Image, Edit, Eye, RefreshCw, SwitchCamera, Plus, Type, Upload, Bold, Italic, Underline, Trash2, Check, X, Search, MessageCircle, AtSign, Book, LayoutPanelTop, BookA } from 'lucide-react';
import theme from '../theme';
import { undo, saveCurrentVersion, removeVersion, revertToVersion } from '../store/songSlice';
import { addElement, resetCurrentMoodBoard, updateElementContent, addMoodBoard, removeMoodBoard, renameMoodBoard, switchMoodBoard } from '../store/moodBoardSlice';

function Toolbar({
  isMoodBoardVisible,
  setIsMoodBoardVisible,
  isEditingMoodBoard,
  setIsEditingMoodBoard,
  isFocusModeActive,
  toggleFocusMode
}) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { currentSong, historyIndex } = useSelector(state => state.song);
  const { moodBoards, currentMoodBoardId } = useSelector(state => state.moodBoard);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isVersionControlOpen, setIsVersionControlOpen] = useState(false);
  const [isMoodBoardOpen, setIsMoodBoardOpen] = useState(false);
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [showMoodBoardModal, setShowMoodBoardModal] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [newElementType, setNewElementType] = useState('image');
  const [newElementContent, setNewElementContent] = useState('');
  const [textStyle, setTextStyle] = useState({ bold: false, italic: false, underline: false });
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [newMoodBoardName, setNewMoodBoardName] = useState('');
  const [editingMoodBoardId, setEditingMoodBoardId] = useState(null);
  const [editingMoodBoardName, setEditingMoodBoardName] = useState('');
  const fileInputRef = useRef(null);
  const [editingElement, setEditingElement] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  const currentMoodBoard = moodBoards.find(board => board.id === currentMoodBoardId);
  const isCurrentMoodBoardEmpty = currentMoodBoard && currentMoodBoard.elements.length === 0;

  // New state to track which panel is open
  const [openPanel, setOpenPanel] = useState(null);

  // Check if undo is available
  const isUndoAvailable = historyIndex > 0;

  const handleUndo = () => {
    if (isUndoAvailable) {
      dispatch(undo());
    }
  };

  const handlePanelClick = (panelName) => {
    if (openPanel === panelName) {
      setOpenPanel(null);
    } else {
      setOpenPanel(panelName);
    }
  };

  const handleToolsClick = () => {
    setIsToolsOpen(!isToolsOpen);
  };

  const handleFeedbackClick = () => {
    setIsFeedbackOpen(!isFeedbackOpen);
  };

  const handleVersionControlClick = () => {
    setIsVersionControlOpen(!isVersionControlOpen);
  };

  const handleMoodBoardClick = () => {
    setIsMoodBoardOpen(!isMoodBoardOpen);
  };

  const handleEditMoodBoard = () => {
    setIsEditingMoodBoard(!isEditingMoodBoard);
    if (!isEditingMoodBoard && !isMoodBoardVisible) {
      setIsMoodBoardVisible(true);
    }
  };

  const handleToggleMoodBoardVisibility = () => {
    setIsMoodBoardVisible(!isMoodBoardVisible);
    if (isEditingMoodBoard && isMoodBoardVisible) {
        setIsEditingMoodBoard(false);
    }
  };

  const handleResetMoodBoard = () => {
    if (!isCurrentMoodBoardEmpty) {
      setShowResetConfirmation(true);
    }
  };

  const confirmResetMoodBoard = () => {
    dispatch(resetCurrentMoodBoard());
    setShowResetConfirmation(false);
  };

  const handleAddToMoodBoard = () => {
    setShowAddElementModal(true);
  };

  const handleChangeMoodBoard = () => {
    setShowMoodBoardModal(true);
  };

  const handleAddMoodBoard = () => {
    if (newMoodBoardName.trim()) {
      dispatch(addMoodBoard(newMoodBoardName.trim()));
      setNewMoodBoardName('');
    }
  };

  const handleRemoveMoodBoard = (id) => {
    dispatch(removeMoodBoard(id));
  };

  const handleRenameMoodBoard = (id) => {
    if (editingMoodBoardName.trim() && id === editingMoodBoardId) {
      const currentName = moodBoards.find(board => board.id === id).name;
      if (editingMoodBoardName.trim() !== currentName) {
        dispatch(renameMoodBoard({ id, newName: editingMoodBoardName.trim() }));
      }
      setEditingMoodBoardId(null);
      setEditingMoodBoardName('');
    }
  };

  const handleSwitchMoodBoard = (id) => {
    dispatch(switchMoodBoard(id));
    setShowMoodBoardModal(false);
  };

  const handleAddElement = () => {
    if (newElementType && newElementContent) {
      dispatch(addElement({
        type: newElementType,
        content: newElementContent,
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        size: { width: 200, height: 200 },
        style: newElementType === 'text' ? {
          ...textStyle,
          color: textColor,
          fontSize,
          fontFamily: 'Arial, sans-serif' // Add this line
        } : {},
      }));
      setShowAddElementModal(false);
      setNewElementType('image');
      setNewElementContent('');
      setTextStyle({ bold: false, italic: false, underline: false });
      setTextColor('#000000');
      setFontSize(16);
    }
  };

  const handleUpdateTextElement = () => {
    if (editingElement && editingElement.type === 'text') {
      dispatch(updateElementContent({
        id: editingElement.id,
        content: newElementContent,
        style: {
          ...editingElement.style,
          ...textStyle,
          color: textColor,
          fontSize,
        },
      }));
      setEditingElement(null);
      setShowAddElementModal(false);
    }
  };

  const displaySuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the 2 MB limit. Please choose a smaller file.`);
        e.target.value = ''; // Clear the file input
        return;
      }
  
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(`Invalid file type: ${file.type}. Please upload a JPEG, PNG, or GIF image.`);
        e.target.value = ''; // Clear the file input
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewElementType('image');
        setNewElementContent(event.target.result);
        displaySuccessMessage(`File "${file.name}" successfully uploaded!`);
      };
      reader.onerror = (error) => {
        alert(`Error reading file: ${error}`);
        e.target.value = ''; // Clear the file input
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTextStyle = (style) => {
    setTextStyle(prev => ({ ...prev, [style]: !prev[style] }));
  };

  const handleSaveVersion = () => {
    dispatch(saveCurrentVersion());
  };

  const handleRemoveVersion = (versionIndex) => {
    dispatch(removeVersion({ songId: currentSong.id, versionIndex }));
  };

  const handleRevertToVersion = (versionIndex) => {
    dispatch(revertToVersion({ songId: currentSong.id, versionIndex }));
  };

  return (
    <>
      <div className={`toolbar fixed bottom-0 left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] bg-opacity-45 border-t border-[${theme.common.grey}] p-2 flex justify-center items-center z-50`}>
        <div className="flex space-x-4">
          <button
            onClick={handleUndo}
            className={`undo bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded transition-opacity ${isUndoAvailable ? 'hover:opacity-80' : 'opacity-50 cursor-not-allowed'}`}
            title={isUndoAvailable ? "Undo" : "No actions to undo"}
            disabled={!isUndoAvailable}
          >
            <Undo size={20} />
          </button>
          <button
            onClick={() => handlePanelClick('tools')}
            className={`tools bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${openPanel === 'tools' ? 'opacity-60' : ''}`}
            title="Tools"
          >
            <Wrench size={20} />
          </button>
          <button
            onClick={() => handlePanelClick('feedback')}
            className={`feedback bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${openPanel === 'feedback' ? 'opacity-60' : ''}`}
            title="Feedback"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={toggleFocusMode}
            className={`focus bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isFocusModeActive ? 'opacity-60' : ''}`}
            title={isFocusModeActive ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            <Sparkle size={20} />
          </button>
          <button
            onClick={() => handlePanelClick('versionControl')}
            className={`version bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${openPanel === 'versionControl' ? 'opacity-60' : ''}`}
            title="Version Control"
          >
            <GitBranch size={20} />
          </button>
          <button
            onClick={() => handlePanelClick('moodBoard')}
            className={`moodboard bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${openPanel === 'moodBoard' ? 'opacity-60' : ''}`}
            title="Mood Board"
          >
            <Image size={20} />
          </button>
          {openPanel === 'tools' && (
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] bg-opacity-50 p-2 rounded-lg shadow-lg mb-2 mx-4 max-w-2xl w-full`}
              style={{ left: 'calc(50% - 16px)' }}  // Adjusted position
            >
              <div className="flex justify-center space-x-4">
                <button
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Dictionary"
                >
                  <BookA size={20} />
                </button>
                <button
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Rhyme Finder"
                >
                  <Search size={20} />
                </button>
                <button
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Metaphor Generator"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Simile Generator"
                >
                  <AtSign size={20} />
                </button>
                <button
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Cultural Reference Search"
                >
                  <Book size={20} />
                </button>
                <button
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Song Templates"
                >
                  <LayoutPanelTop size={20} />
                </button>
              </div>
            </div>
          )}
          {openPanel === 'feedback' && (
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] bg-opacity-50 p-2 rounded-lg shadow-lg mb-2 mx-4 max-w-2xl w-full`}
              style={{ left: 'calc(50% - 16px)' }}  // Adjusted position
            >
              <p className="text-center">Feedback panel (to be implemented)</p>
            </div>
          )}
          {openPanel === 'versionControl' && (
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] bg-opacity-50 p-2 rounded-lg shadow-lg mb-2 mx-4 max-w-2xl w-full`} style={{ maxHeight: '200px', overflowY: 'auto', left: 'calc(50% - 16px)' }}>
              <div className="h-full flex flex-col p-4">
                <h3 className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] text-lg font-bold mb-2`}>Version Control</h3>
                <button
                  onClick={handleSaveVersion}
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-4 py-2 rounded hover:opacity-80 mb-2`}
                >
                  Save Current Version
                </button>
                <div className="flex-grow overflow-y-auto">
                  {currentSong.versions.length > 0 ? (
                    <ul className="space-y-2">
                      {currentSong.versions.map((version, index) => (
                        <li key={version.timestamp} className="flex items-center justify-between">
                          <span className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] text-sm`}>
                            {new Date(version.timestamp).toLocaleString()} - {version.title}
                          </span>
                          <div>
                            <button
                              onClick={() => handleRevertToVersion(index)}
                              className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-2 py-1 rounded hover:opacity-80 mr-2 text-xs`}
                            >
                              Revert
                            </button>
                            <button
                              onClick={() => handleRemoveVersion(index)}
                              className={`bg-red-500 text-white px-2 py-1 rounded hover:opacity-80 text-xs`}
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>No versions saved yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {openPanel === 'moodBoard' && (
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] bg-opacity-50 p-2 rounded-lg shadow-lg mb-2 mx-4 max-w-2xl w-full`}
              style={{ left: 'calc(50% - 16px)' }}  // Adjusted position
            >
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleEditMoodBoard}
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isEditingMoodBoard ? 'opacity-60' : ''}`}
                  title={isEditingMoodBoard ? "Exit Editing Mode" : "Enter Editing Mode"}
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={handleToggleMoodBoardVisibility}
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${!isMoodBoardVisible ? 'opacity-60' : ''}`}
                  title={isMoodBoardVisible ? "Hide Mood Board" : "Show Mood Board"}
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={() => setShowResetConfirmation(true)}
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isCurrentMoodBoardEmpty ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Reset Mood Board"
                  disabled={isCurrentMoodBoardEmpty}
                >
                  <RefreshCw size={20} />
                </button>
                <button
                  onClick={() => setShowMoodBoardModal(true)}
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Change Mood Board"
                >
                  <SwitchCamera size={20} />
                </button>
                <button
                  onClick={() => setShowAddElementModal(true)}
                  className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
                  title="Add to Mood Board"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <h2 className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] text-2xl font-bold mb-6`}>
              Clear Mood Board
            </h2>
            <p className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] mb-6`}>
              Are you sure you want to clear all elements from the current mood board? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className={`bg-[${theme.common.grey}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] px-6 py-2 rounded hover:opacity-80 transition-opacity`}
              >
                Cancel
              </button>
              <button
                onClick={confirmResetMoodBoard}
                className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-6 py-2 rounded hover:opacity-80 transition-opacity`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddElementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <h2 className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] text-2xl font-bold mb-6`}>
              {editingElement ? 'Edit Text Element' : 'Add Element to Mood Board'}
            </h2>
            {!editingElement && (
              <div className="mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setNewElementType('text')}
                    className={`flex-1 p-3 rounded ${newElementType === 'text' ? `bg-[${theme.common.brown}] text-[${theme.common.white}]` : `bg-[${theme.common.grey}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`} transition-colors`}
                  >
                    <Type size={24} className="mx-auto mb-2" />
                    <span>Text</span>
                  </button>
                  <button
                    onClick={() => setNewElementType('image')}
                    className={`flex-1 p-3 rounded ${newElementType === 'image' ? `bg-[${theme.common.brown}] text-[${theme.common.white}]` : `bg-[${theme.common.grey}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`} transition-colors`}
                  >
                    <Image size={24} className="mx-auto mb-2" />
                    <span>Image</span>
                  </button>
                </div>
              </div>
            )}
            <div className="mb-6">
              {(newElementType === 'text' || editingElement) ? (
                <div>
                  <textarea
                    value={newElementContent}
                    onChange={(e) => setNewElementContent(e.target.value)}
                    className={`w-full p-2 border rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] mb-2`}
                    placeholder="Enter text"
                    rows={4}
                    style={{
                      fontWeight: textStyle.bold ? 'bold' : 'normal',
                      fontStyle: textStyle.italic ? 'italic' : 'normal',
                      textDecoration: textStyle.underline ? 'underline' : 'none',
                      color: textColor,
                      fontSize: `${fontSize}px`,
                    }}
                  />
                  <div className="flex items-center space-x-2 mb-2">
                    <button onClick={() => toggleTextStyle('bold')} className={`p-1 rounded ${textStyle.bold ? 'bg-gray-300' : ''}`}><Bold size={20} /></button>
                    <button onClick={() => toggleTextStyle('italic')} className={`p-1 rounded ${textStyle.italic ? 'bg-gray-300' : ''}`}><Italic size={20} /></button>
                    <button onClick={() => toggleTextStyle('underline')} className={`p-1 rounded ${textStyle.underline ? 'bg-gray-300' : ''}`}><Underline size={20} /></button>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8"
                    />
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className={`w-16 p-1 border rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
                      min="8"
                      max="72"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={newElementContent}
                    onChange={(e) => setNewElementContent(e.target.value)}
                    className={`w-full p-2 border rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] mb-2`}
                    placeholder="Enter image URL"
                  />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center mb-2">
                      <span className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] mr-2`}>Or</span>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-4 py-2 rounded hover:opacity-80 flex items-center`}
                      >
                        <Upload size={20} className="mr-2" />
                        Upload Image
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <span className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] ml-2`}>
                        (JPG, PNG, GIF, max 2 MB)
                      </span>
                    </div>
                    {successMessage && (
                      <div className={`text-green-500 mt-2 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} p-2 rounded`}>
                        {successMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAddElementModal(false);
                  setEditingElement(null);
                }}
                className={`bg-[${theme.common.grey}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] px-6 py-2 rounded hover:opacity-80 transition-opacity`}
              >
                Cancel
              </button>
              <button
                onClick={editingElement ? handleUpdateTextElement : handleAddElement}
                className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-6 py-2 rounded hover:opacity-80 transition-opacity`}
              >
                {editingElement ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMoodBoardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] flex flex-col`}>
            <h2 className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] text-2xl font-bold mb-6`}>
              Manage Mood Boards
            </h2>
            <div className="mb-6 flex items-center justify-center">
              <input
                type="text"
                value={newMoodBoardName}
                onChange={(e) => setNewMoodBoardName(e.target.value)}
                className={`w-2/3 p-2 rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] mr-2`}
                placeholder="New mood board name"
              />
              <button
                onClick={handleAddMoodBoard}
                className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-3 py-2 rounded hover:opacity-80 text-sm`}
              >
                Add
              </button>
            </div>
            <ul className="space-y-2 mb-6 overflow-y-auto flex-grow">
              {moodBoards.map((board) => (
                <li key={board.id} className="flex items-center justify-between">
                  {editingMoodBoardId === board.id ? (
                    <input
                      type="text"
                      value={editingMoodBoardName}
                      onChange={(e) => setEditingMoodBoardName(e.target.value)}
                      onBlur={() => handleRenameMoodBoard(board.id)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRenameMoodBoard(board.id)}
                      className={`flex-grow p-2 rounded bg-[${isDarkMode ? theme.dark.input : theme.light.input}] text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
                      autoFocus
                    />
                  ) : (
                    <span className={`flex-grow text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
                      {board.name}
                    </span>
                  )}
                  <div className="flex space-x-3">
                    {editingMoodBoardId === board.id ? (
                      <>
                        <button
                          onClick={() => handleRenameMoodBoard(board.id)}
                          className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] hover:text-[${theme.common.brown}]`}
                        >
                          <Check size={20} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingMoodBoardId(board.id);
                          setEditingMoodBoardName(board.name);
                        }}
                        className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] hover:text-[${theme.common.brown}]`}
                      >
                        <Edit size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMoodBoard(board.id)}
                      className={`text-[${isDarkMode ? theme.dark.text : theme.light.text}] hover:text-red-500`}
                    >
                      <Trash2 size={20} />
                    </button>
                    {board.id !== currentMoodBoardId && (
                      <button
                        onClick={() => handleSwitchMoodBoard(board.id)}
                        className={`bg-[${theme.common.brown}] text-[${theme.common.white}] px-2 py-1 rounded hover:opacity-80 text-sm`}
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowMoodBoardModal(false)}
              className={`bg-[${theme.common.grey}] text-[${isDarkMode ? theme.dark.text : theme.light.text}] px-6 py-2 rounded hover:opacity-80 transition-opacity`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Toolbar;