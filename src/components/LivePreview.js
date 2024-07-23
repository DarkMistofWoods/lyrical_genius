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

  const parseSections = (lyrics) => {
    const sectionRegex = /\[(.*?)\]([\s\S]*?)(?=\[|$)/g;
    const matches = [...lyrics.matchAll(sectionRegex)];
    return matches.map(match => ({
      type: match[1].trim().toLowerCase(),
      content: match[2].trim()
    }));
  };

  const parsedSections = parseSections(currentSong.lyrics);

  return (
    <div className={`flex-1 p-4 overflow-auto ${isDarkMode ? 'bg-dark-background text-dark-text' : 'bg-light-background text-light-text'}`}>
      <h2 className="text-xl font-bold mb-2">{currentSong.title || 'Untitled'}</h2>
      {styleString && (
        <div className="text-sm italic mb-4">{styleString}</div>
      )}
      <div className="whitespace-pre-wrap">
        {parsedSections.map((section, index) => (
          <div key={index} className="mb-4">
            <div className="font-bold text-sm">[{section.type}]</div>
            <div>{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LivePreview;