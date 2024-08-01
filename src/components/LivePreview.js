import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import theme from '../theme';
import ConfirmationPopup from './ConfirmationPopup';
import { Eye, EyeOff } from 'lucide-react';

function LivePreview() {
  const { currentSong } = useSelector(state => state.song);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hideBrackets, setHideBrackets] = useState(false);
  const [formattedLyrics, setFormattedLyrics] = useState('');
  const [lyricsOnly, setLyricsOnly] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const parseSections = (lyrics) => {
    const sectionRegex = /\[(.*?)\](?:\|\|\|([\s\S]*?))?(?=\n\n\[|$)/g;
    const matches = [...lyrics.matchAll(sectionRegex)];
  
    return matches.map(match => {
      const type = match[1].trim().toLowerCase();
      const content = match[2] ? match[2].trim() : '';
      return { type, content };
    });
  };

  useEffect(() => {
    const parsedSections = parseSections(currentSong.lyrics);
    const styleString = Object.values(currentSong.style)
      .flat()
      .filter(Boolean)
      .join(', ');

    let lyricsContent;
    if (hideBrackets) {
      lyricsContent = parsedSections
        .map(section => section.content)
        .filter(content => content.length > 0)
        .join('\n\n');
    } else {
      lyricsContent = parsedSections
        .map(section => `[${section.type}]${section.content ? '\n' + section.content : ''}`)
        .join('\n\n');
    }

    setFormattedLyrics(`${currentSong.title || 'Untitled'}\n\n${styleString}\n\n${lyricsContent}`);
    setLyricsOnly(lyricsContent);

    // Count words and characters, excluding bracketed content
    const contentOnly = parsedSections.map(section => section.content).join(' ');
    const words = contentOnly.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setCharCount(contentOnly.replace(/\s/g, '').length);
  }, [currentSong, hideBrackets]);

  const handleCopy = () => {
    navigator.clipboard.writeText(lyricsOnly)
      .then(() => setShowConfirmation(true))
      .catch(err => console.error('Failed to copy lyrics: ', err));
  };

  const toggleBrackets = () => {
    setHideBrackets(!hideBrackets);
  };
  
  return (
    <div className={`bg-[${theme.common.grey}] text-[${theme.common.white}] rounded-lg p-4 h-auto relative`}>
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold break-words">{currentSong.title || 'Untitled'}</h2>
        <button
          onClick={toggleBrackets}
          className={`flex items-center bg-[${theme.common.brown}] text-[${theme.common.white}] py-1 px-3 rounded text-sm hover:opacity-80`}
        >
          {hideBrackets ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
          {hideBrackets ? 'Show' : 'Hide'} Brackets
        </button>
      </div>
      <div className="text-sm italic mb-4">
        {Object.values(currentSong.style).flat().filter(Boolean).join(', ')}
      </div>
      <div className="whitespace-pre-wrap mb-4">
        {formattedLyrics.split('\n\n').slice(2).join('\n\n')}
      </div>
      <div className="text-center text-xs mb-8">
        Words: {wordCount} | Characters: {charCount}
      </div>
      <button
        onClick={handleCopy}
        className={`bg-[${theme.common.brown}] text-[${theme.common.white}] py-1 px-3 rounded text-sm hover:opacity-80 absolute bottom-4 right-4`}
      >
        Copy Lyrics
      </button>
      {showConfirmation && (
        <ConfirmationPopup
          message="Your lyrics have been copied to your clipboard.
          Best of luck with your generation(s)!"
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}

export default LivePreview;