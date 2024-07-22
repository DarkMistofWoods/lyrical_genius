import React from 'react';
import { useSelector } from 'react-redux';

function LivePreview() {
  const { title, lyrics, style } = useSelector(state => state.song.currentSong);

  const wordCount = lyrics.split(/\s+/).filter(Boolean).length;
  const characterCount = lyrics.length;
  const lineCount = lyrics.split('\n').filter(Boolean).length;

  const allStyles = Object.values(style)
    .flat()
    .filter(s => s && s.trim() !== '')
    .map(s => s.toLowerCase());
  const styleString = allStyles.join(', ');

  return (
    <div className="flex-1 p-4 bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Live Preview</h2>
      <h3 className="text-lg font-semibold mb-2">{title || 'Untitled'}</h3>
      {styleString && <p className="text-sm text-gray-600 mb-2">{styleString}</p>}
      <div className="whitespace-pre-wrap mb-4">
        {lyrics}
      </div>
      <div className="mt-4">
        <p>Words: {wordCount}</p>
        <p>Characters: {characterCount}</p>
        <p>Lines: {lineCount}</p>
      </div>
    </div>
  );
}

export default LivePreview;