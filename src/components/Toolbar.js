import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Undo, Wrench } from 'lucide-react';
import theme from '../theme';

function Toolbar({ onUndo }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const handleToolsClick = () => {
    setIsToolsOpen(!isToolsOpen);
    // TODO: Implement tools functionality
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border-t border-[${theme.common.grey}] p-2 flex justify-center items-center z-50`}>
      <div className="flex space-x-4">
        <button
          onClick={onUndo}
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
      </div>
      {isToolsOpen && (
        <div className={`absolute bottom-full left-0 right-0 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] border-t border-[${theme.common.grey}] p-4 shadow-lg`}>
          <p className="text-center">Tools panel (to be implemented)</p>
        </div>
      )}
    </div>
  );
}

export default Toolbar;