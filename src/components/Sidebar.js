import React from 'react';
import SongList from './SongList';

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <SongList />
      {/* Add new song and delete song buttons here */}
    </aside>
  );
}

export default Sidebar;