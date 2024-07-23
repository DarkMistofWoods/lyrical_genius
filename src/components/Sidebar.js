import React from 'react';
import { useSelector } from 'react-redux';
import SongList from './SongList';

function Sidebar() {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  return (
    <aside className={`w-64 p-4 ${isDarkMode ? 'bg-[#595859] text-[#F2F2F2]' : 'bg-[#F2F2F2] text-[#0D0C0C]'}`}>
      <SongList />
      {/* Add new song and delete song buttons here */}
    </aside>
  );
}

export default Sidebar;