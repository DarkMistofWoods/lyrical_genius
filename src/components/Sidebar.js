import React from 'react';
import { useSelector } from 'react-redux';
import SongList from './SongList';
import theme from '../theme';

function Sidebar() {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  return (
    <aside className={`h-full bg-[${theme.common.grey}] text-[${theme.common.white}] rounded-lg mx-4`}>
      <SongList />
    </aside>
  );
}

export default Sidebar;