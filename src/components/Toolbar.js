import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Undo, Wrench, MessageSquare, Sparkle, GitBranch, Image, Edit, Eye, RefreshCw, Copy, Plus } from 'lucide-react';
import theme from '../theme';
import { undo } from '../store/songSlice';

function Toolbar() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFocusModeOn, setIsFocusModeOn] = useState(false);
  const [isVersionControlOpen, setIsVersionControlOpen] = useState(false);
  const [isMoodBoardOpen, setIsMoodBoardOpen] = useState(false);
  const [isEditingMoodBoard, setIsEditingMoodBoard] = useState(false);
  const [isMoodBoardVisible, setIsMoodBoardVisible] = useState(true);

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleToolsClick = () => {
    setIsToolsOpen(!isToolsOpen);
  };

  const handleFeedbackClick = () => {
    setIsFeedbackOpen(!isFeedbackOpen);
  };

  const handleFocusModeClick = () => {
    setIsFocusModeOn(!isFocusModeOn);
  };

  const handleVersionControlClick = () => {
    setIsVersionControlOpen(!isVersionControlOpen);
  };

  const handleMoodBoardClick = () => {
    setIsMoodBoardOpen(!isMoodBoardOpen);
  };

  const handleEditMoodBoard = () => {
    setIsEditingMoodBoard(!isEditingMoodBoard);
    // TODO: Implement editing mode functionality
  };

  const handleToggleMoodBoardVisibility = () => {
    setIsMoodBoardVisible(!isMoodBoardVisible);
    // TODO: Implement visibility toggle functionality
  };

  const handleResetMoodBoard = () => {
    // TODO: Implement reset functionality
    console.log('Reset mood board');
  };

  const handleCopyMoodBoard = () => {
    // TODO: Implement copy functionality
    console.log('Copy mood board');
  };

  const handleAddToMoodBoard = () => {
    // TODO: Implement add functionality
    console.log('Add to mood board');
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border-t border-[${theme.common.grey}] p-2 flex justify-center items-center z-50`}>
      <div className="flex space-x-4">
        <button
          onClick={handleUndo}
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
          title="Undo"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={handleToolsClick}
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isToolsOpen ? 'opacity-60' : ''}`}
          title="Tools"
        >
          <Wrench size={20} />
        </button>
        <button
          onClick={handleFeedbackClick}
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isFeedbackOpen ? 'opacity-60' : ''}`}
          title="Feedback"
        >
          <MessageSquare size={20} />
        </button>
        <button
          onClick={handleFocusModeClick}
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isFocusModeOn ? 'opacity-60' : ''}`}
          title="Focus Mode"
        >
          <Sparkle size={20} />
        </button>
        <button
          onClick={handleVersionControlClick}
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isVersionControlOpen ? 'opacity-60' : ''}`}
          title="Version Control"
        >
          <GitBranch size={20} />
        </button>
        <button
          onClick={handleMoodBoardClick}
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isMoodBoardOpen ? 'opacity-60' : ''}`}
          title="Mood Board"
        >
          <Image size={20} />
        </button>
      </div>
      {isToolsOpen && (
        <div className={`absolute bottom-full left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border-t border-[${theme.common.grey}] p-4 shadow-lg`}>
          <p className="text-center">Tools panel (to be implemented)</p>
        </div>
      )}
      {isFeedbackOpen && (
        <div className={`absolute bottom-full left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border-t border-[${theme.common.grey}] p-4 shadow-lg`}>
          <p className="text-center">Feedback panel (to be implemented)</p>
        </div>
      )}
      {isVersionControlOpen && (
        <div className={`absolute bottom-full left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border-t border-[${theme.common.grey}] p-4 shadow-lg`}>
          <p className="text-center">Version Control panel (to be implemented)</p>
        </div>
      )}
      {isMoodBoardOpen && (
        <div className={`absolute bottom-full left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border-t border-[${theme.common.grey}] p-4 shadow-lg`}>
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
              onClick={handleResetMoodBoard}
              className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
              title="Reset Mood Board"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={handleCopyMoodBoard}
              className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
              title="Copy Mood Board"
            >
              <Copy size={20} />
            </button>
            <button
              onClick={handleAddToMoodBoard}
              className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity`}
              title="Add to Mood Board"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Toolbar;