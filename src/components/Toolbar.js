import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Undo, Wrench, MessageSquare, Sparkle, GitBranch, Image } from 'lucide-react';
import theme from '../theme';
import { undo } from '../store/songSlice';

function Toolbar() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFocusModeOn, setIsFocusModeOn] = useState(false);
  const [isVersionControlOpen, setIsVersionControlOpen] = useState(false);
  const [isMoodBoardActive, setIsMoodBoardActive] = useState(false);

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleToolsClick = () => {
    setIsToolsOpen(!isToolsOpen);
    // TODO: Implement tools functionality
  };

  const handleFeedbackClick = () => {
    setIsFeedbackOpen(!isFeedbackOpen);
    // TODO: Implement feedback panel functionality
  };

  const handleFocusModeClick = () => {
    setIsFocusModeOn(!isFocusModeOn);
    // TODO: Implement focus mode functionality
  };

  const handleVersionControlClick = () => {
    setIsVersionControlOpen(!isVersionControlOpen);
    // TODO: Implement version control functionality
  };

  const handleMoodBoardClick = () => {
    setIsMoodBoardActive(!isMoodBoardActive);
    // TODO: Implement mood board functionality
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
          className={`bg-[${theme.common.brown}] text-[${theme.common.white}] p-2 rounded hover:opacity-80 transition-opacity ${isMoodBoardActive ? 'opacity-60' : ''}`}
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
    </div>
  );
}

export default Toolbar;