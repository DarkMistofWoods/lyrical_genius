import React from 'react';
import { useSelector } from 'react-redux';
import theme from '../theme';

function LivePreview() {
  const { currentSong } = useSelector(state => state.song);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  const parseSections = (lyrics) => {
    const sectionRegex = /\[(.*?)\]([\s\S]*?)(?=\[|$)/g;
    const matches = [...lyrics.matchAll(sectionRegex)];

    return matches.map(match => {
      const type = match[1].trim().toLowerCase();
      const content = match[2].trim();
      return { type, content };
    });
  };

  const parsedSections = parseSections(currentSong.lyrics);

  const styleString = Object.values(currentSong.style)
    .flat()
    .filter(Boolean)
    .join(', ');

  const formattedLyrics = `${currentSong.title || 'Untitled'}\n\n${styleString}\n\n${parsedSections.map(section => 
    section.type === 'line' ? section.content : 
    section.type === 'dialog' ? `[dialog]\n${section.content}` :
    `[${section.type}]\n${section.content}`
  ).join('\n\n')}`;

  const wordCount = currentSong.lyrics.split(/\s+/).filter(Boolean).length;
  const charCount = currentSong.lyrics.length;
  const lineCount = currentSong.lyrics.split('\n').filter(Boolean).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedLyrics)
      .then(() => alert('Lyrics copied to clipboard!'))
      .catch(err => console.error('Failed to copy lyrics: ', err));
  };
  
  return (
    <div className={`bg-[${theme.common.grey}] text-[${theme.common.white}] rounded-lg p-4 h-auto relative`}>
      <div className="mb-2">
        <h2 className="text-xl font-bold break-words">{currentSong.title || 'Untitled'}</h2>
      </div>
      {styleString && (
        <div className="text-sm italic mb-4">{styleString}</div>
      )}
      <div className="whitespace-pre-wrap mb-4">
        {parsedSections.map((section, index) => (
          <div key={index} className="mb-4">
            {section.type !== 'line' && (
              <div className="font-bold text-sm">
                {section.type === 'dialog' ? '[dialog]' : `[${section.type}]`}
              </div>
            )}
            <div>{section.content}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-xs mb-8">
        Words: {wordCount} | Characters: {charCount} | Lines: {lineCount}
      </div>
      <button
        onClick={handleCopy}
        className={`bg-[${theme.common.brown}] text-[${theme.common.white}] py-1 px-3 rounded text-sm hover:opacity-80 absolute bottom-4 right-4`}
      >
        Copy Lyrics
      </button>
    </div>
  );
}

export default LivePreview;