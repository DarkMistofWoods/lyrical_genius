import React from 'react';
import { useSelector } from 'react-redux';

function LivePreview() {
  const { currentSong } = useSelector(state => state.song);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  const sections = currentSong.lyrics.split('\n\n').filter(Boolean);

  const styleString = Object.entries(currentSong.style)
    .filter(([_, values]) => values.length > 0)
    .map(([category, values]) => values.join(', '))
    .join(', ');

  return (
    <div className={`flex-1 p-4 overflow-auto ${isDarkMode ? 'bg-dark-background text-dark-text' : 'bg-light-background text-light-text'}`}>
      <h2 className="text-xl font-bold mb-2">{currentSong.title || 'Untitled'}</h2>
      {styleString && (
        <div className="text-sm italic mb-4">{styleString}</div>
      )}
      <div className="whitespace-pre-wrap">
        {sections.map((section, index) => {
          const lines = section.split('\n');
          const sectionType = lines[0].replace(/[\[\]]/g, '').trim().toLowerCase();
          const content = lines.slice(1).join('\n');
          return (
            <div key={index} className="mb-4">
              <div className="font-bold text-sm">[{sectionType}]</div>
              <div>{content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LivePreview;