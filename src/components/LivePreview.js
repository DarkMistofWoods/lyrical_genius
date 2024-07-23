import React from 'react';
import { useSelector } from 'react-redux';

function LivePreview({ onCopyLyrics }) {
  const { currentSong } = useSelector(state => state.song);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  const parseSections = (lyrics) => {
    const sectionRegex = /\[(.*?)\]([\s\S]*?)(?=\[|$)/g;
    const matches = [...lyrics.matchAll(sectionRegex)];
    return matches.map(match => ({
      type: match[1].trim().toLowerCase(),
      content: match[2].trim()
    }));
  };

  const parsedSections = parseSections(currentSong.lyrics);

  const styleString = Object.entries(currentSong.style)
    .filter(([_, values]) => values.length > 0)
    .map(([category, values]) => values.join(', '))
    .join(', ');

  return (
    <div className={`w-full h-full overflow-auto p-4 ${isDarkMode ? 'bg-dark-background text-dark-text' : 'bg-light-background text-light-text'}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{currentSong.title || 'Untitled'}</h2>
        <button
          onClick={onCopyLyrics}
          className={`${isDarkMode ? 'bg-purple-500' : 'bg-purple-600'} text-white py-1 px-3 rounded text-sm hover:opacity-80`}
        >
          Copy Lyrics
        </button>
      </div>
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