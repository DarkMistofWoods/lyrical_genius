import React from 'react';
import { useSelector } from 'react-redux';
import { Settings, Copy, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import theme from '../theme';

const verseNumbers = [1, 2, 3, 4, 5, 6, 7];
const sectionTypes = ['Verse', 'Chorus', 'Bridge', 'Pre-Hook', 'Line', 'Dialog', 'Pre-Chorus'];

function Section({ 
  section, 
  index, 
  editingSectionAt,
  setEditingSectionAt, 
  duplicateSection, 
  changeVerseNumber, 
  removeSection, 
  moveSection, 
  handleSectionChange,
  sectionsLength,
  changeSectionType
}) {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  if (section.type === 'StructureModifier') {
    return (
      <div className={`p-2 rounded bg-[${theme.common.brown}] text-[${theme.common.white}] flex justify-between items-center w-full mb-4 relative z-10`}>
        <span>{section.content}</span>
        <div className="flex">
          <button
            onClick={() => moveSection(index, 'up')}
            className={`text-[#F2F2F2] hover:text-[#0D0C0C] mr-2 ${index === 0 ? 'opacity-50' : ''}`}
            style={{ pointerEvents: 'auto' }}
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={() => moveSection(index, 'down')}
            className={`text-[#F2F2F2] hover:text-[#0D0C0C] mr-2 ${index === sectionsLength - 1 ? 'opacity-50' : ''}`}
            style={{ pointerEvents: 'auto' }}
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={() => removeSection(index)}
            className="text-[#F2F2F2] hover:text-[#0D0C0C]"
            style={{ pointerEvents: 'auto' }}
          >
            <XCircle size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start relative">
      <div className="flex-grow relative">
        <div className="flex items-center mb-1">
          <span className="font-bold text-sm mr-2">{section.type}</span>
          <button
            onClick={() => setEditingSectionAt(editingSectionAt === index ? null : index)}
            className="text-[#A68477] hover:text-[#595859] mr-2"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => duplicateSection(index)}
            className="text-[#A68477] hover:text-[#595859] mr-2"
          >
            <Copy size={16} />
          </button>
          {section.type === 'Verse' && (
            <div className="flex items-center">
              {verseNumbers.map(num => (
                <button
                  key={num}
                  onClick={() => changeVerseNumber(index, num)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full mr-1 ${
                    section.verseNumber === num
                      ? 'bg-[#A68477] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}
        </div>
        <textarea
          placeholder={`Enter your ${section.type.toLowerCase()} lyrics here...`}
          className={`w-full p-2 border rounded ${
            isDarkMode ? 'bg-[#403E3F] text-[#F2F2F2] border-[#595859]' : 'bg-[#F2F2F2] text-[#0D0C0C] border-[#595859]'
          }`}
          value={section.content}
          onChange={(e) => handleSectionChange(index, e.target.value)}
          rows={6}
        ></textarea>
        {editingSectionAt === index && (
          <div className={`absolute z-50 top-6 left-0 ${isDarkMode ? 'bg-[#595859]' : 'bg-[#F2F2F2]'} border border-[#595859] rounded shadow-lg`}>
            {sectionTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  changeSectionType(index, type);
                  setEditingSectionAt(null);
                }}
                className={`block w-full text-left px-4 py-2 hover:${isDarkMode ? 'bg-[#0D0C0C]' : 'bg-[#A68477]'} ${isDarkMode ? 'text-[#F2F2F2]' : 'text-[#0D0C0C]'}`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ml-2 flex flex-col justify-center h-full">
        <button
          onClick={() => removeSection(index)}
          className="text-[#A68477] hover:text-[#595859] mb-2"
        >
          <XCircle size={20} />
        </button>
        <button
          onClick={() => moveSection(index, 'up')}
          className="text-[#A68477] hover:text-[#595859] mb-2"
          disabled={index === 0}
        >
          <ArrowUp size={20} />
        </button>
        <button
          onClick={() => moveSection(index, 'down')}
          className="text-[#A68477] hover:text-[#595859]"
          disabled={index === sectionsLength - 1}
        >
          <ArrowDown size={20} />
        </button>
      </div>
    </div>
  );
}

export default Section;