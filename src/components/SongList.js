import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentSong, addSong, deleteSong, addCategory, deleteCategory, renameCategory, assignSongToCategory, unassignSongFromCategory } from '../store/songSlice';
import { saveSongsToLocalStorage } from '../utils/localStorage';
import theme from '../theme';
import ReactDOM from 'react-dom';
import { Search, X, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

function SongList() {
  const dispatch = useDispatch();
  const { songs, currentSong, categories, categoryColors } = useSelector(state => state.song);
  const [songToDelete, setSongToDelete] = useState(null);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [activeSongForCategory, setActiveSongForCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryAccordionOpen, setIsCategoryAccordionOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showCategories, setShowCategories] = useState(true);
  const [showStyles, setShowStyles] = useState(true);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const editInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (editingCategory && editInputRef.current && !editInputRef.current.contains(event.target)) {
        handleRenameCategory(editingCategory);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingCategory]);

  useEffect(() => {
    const filtered = songs.filter(song => 
      (song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(song.style).flat().some(style => 
        style.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      song.categories.some(category => 
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )) &&
      (selectedCategory ? song.categories.includes(selectedCategory) : true)
    );
    setFilteredSongs(filtered);
  }, [searchTerm, songs, selectedCategory]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
        setActiveSongForCategory(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectSong = (song) => {
    dispatch(setCurrentSong(song));
  };

  const handleNewSong = () => {
    dispatch(addSong());
    saveSongsToLocalStorage(songs);
  };

  const handleDeleteSong = (id) => {
    setSongToDelete(id);
  };

  const confirmDeleteSong = () => {
    if (songToDelete) {
      dispatch(deleteSong(songToDelete));
      saveSongsToLocalStorage(songs.filter(song => song.id !== songToDelete));
      setSongToDelete(null);
    }
  };

  const cancelDeleteSong = () => {
    setSongToDelete(null);
  };

  const handleStyleClick = (style, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSearchTerm(style);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (category, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedCategory(category === selectedCategory ? null : category);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      dispatch(addCategory(newCategoryName.trim()));
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (category) => {
    dispatch(deleteCategory(category));
    if (selectedCategory === category) {
      setSelectedCategory(null);
    }
  };

  const handleRenameCategory = (oldName) => {
    if (editingCategoryName.trim() && oldName !== editingCategoryName.trim()) {
      dispatch(renameCategory({ oldName, newName: editingCategoryName.trim() }));
      if (selectedCategory === oldName) {
        setSelectedCategory(editingCategoryName.trim());
      }
    }
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleAssignCategory = (songId, category) => {
    dispatch(assignSongToCategory({ songId, category }));
    setShowCategoryDropdown(false);
    setActiveSongForCategory(null);
  };

  const handleUnassignCategory = (songId, category) => {
    dispatch(unassignSongFromCategory({ songId, category }));
  };

  const DeleteConfirmationDialog = () => {
    if (!songToDelete) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className={`bg-[${theme.common.white}] p-4 rounded shadow-lg max-w-sm w-full`}>
          <p className={`mb-4 text-center text-[${theme.common.black}]`}>
            Are you sure you want to delete this song? This action cannot be undone.
          </p>
          <div className="flex justify-center">
            <button
              onClick={cancelDeleteSong}
              className={`mr-2 px-4 py-2 bg-[${theme.common.grey}] text-[${theme.common.white}] rounded hover:opacity-80`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteSong}
              className={`px-4 py-2 bg-red-500 text-[${theme.common.white}] rounded hover:opacity-80`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const CategoryDropdown = ({ songId }) => {
    if (!showCategoryDropdown || activeSongForCategory !== songId) return null;

    return (
      <div ref={dropdownRef} className={`absolute right-0 -mt-10 w-48 rounded-md shadow-lg bg-[${isDarkMode ? theme.dark.background : theme.light.background}] ring-1 ring-black ring-opacity-5 z-50`}>
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleAssignCategory(songId, category)}
              className={`block px-4 py-2 text-sm text-[${theme.common.white}] hover:bg-[${theme.common.grey}] w-full text-left`}
              role="menuitem"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const toggleCategoryAccordion = () => {
    setIsCategoryAccordionOpen(!isCategoryAccordionOpen);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-lg font-semibold mb-2">Your Songs</h2>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full p-2 pl-8 pr-8 text-sm border rounded ${
            isDarkMode
              ? `bg-[${theme.dark.input}] text-[${theme.common.white}] border-[${theme.common.grey}]`
              : `bg-[${theme.light.input}] text-[${theme.common.black}] border-[${theme.common.grey}]`
          }`}
        />
        <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
        {(searchTerm || selectedCategory) && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="mb-4">
        <button
          onClick={toggleCategoryAccordion}
          className={`flex items-center justify-between w-full p-2 bg-[${theme.common.grey}] rounded-t`}
        >
          <span className="font-semibold">Categories</span>
          {isCategoryAccordionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isCategoryAccordionOpen && (
          <div className="p-2 bg-[${theme.common.grey}] rounded-b">
            <div className="max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div key={category} className={`flex items-center rounded m-1 px-1 py-0.5 ${selectedCategory === category ? 'ring-2 ring-[#A68477]' : ''}`} style={{ backgroundColor: categoryColors[category] }}>
                    {editingCategory === category ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onBlur={() => handleRenameCategory(category)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleRenameCategory(category);
                          }
                        }}
                        className="bg-transparent border-b border-[#595859] focus:outline-none text-sm text-[#0D0C0C]"
                        autoFocus
                      />
                    ) : (
                      <button
                        className="text-sm text-[#0D0C0C]"
                        onClick={(e) => handleCategoryClick(category, e)}
                      >
                        {category}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setEditingCategoryName(category);
                      }}
                      className="ml-2 text-[#0D0C0C] hover:text-[#595859]"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="ml-2 text-[#0D0C0C] hover:text-[#595859]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="text"
                placeholder="New category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className={`bg-transparent border-b border-[${theme.common.brown}] focus:outline-none text-sm mr-2 flex-grow`}
              />
              <button
                onClick={handleAddCategory}
                className={`text-[${theme.common.white}] hover:text-[${theme.common.grey}]`}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex-grow overflow-y-auto mb-4">
        <ul className="space-y-2 p-2">
          {filteredSongs.map(song => (
            <li 
              key={song.id} 
              className={`p-2 rounded-lg transition-colors duration-200 ${
                currentSong.id === song.id 
                  ? `bg-[#595859] border border-[${theme.common.brown}]`
                  : `bg-[#403E3F] hover:bg-[#4a4849] border border-[${theme.common.grey}]`
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <button
                  onClick={() => handleSelectSong(song)}
                  className={`text-left truncate flex-grow ${currentSong.id === song.id ? 'font-bold' : ''}`}
                >
                  {song.title || 'Untitled'}
                </button>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setActiveSongForCategory(song.id);
                    }}
                    className="text-gray-400 hover:text-gray-200 mr-2"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSong(song.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {showCategories && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {song.categories.map((category) => (
                    <span
                      key={category}
                      className={`text-xs rounded px-1 py-0.5 flex items-center cursor-pointer text-[${theme.common.black}]`}
                      style={{ backgroundColor: categoryColors[category] }}
                      onClick={(e) => handleCategoryClick(category, e)}
                    >
                      {category}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassignCategory(song.id, category);
                        }}
                        className="ml-1 text-[#0D0C0C] hover:text-[#595859]"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {showStyles && (
                <div className="text-xs text-gray-400 italic mt-1">
                  {Object.values(song.style).flat().filter(Boolean).map((style, index, array) => (
                    <React.Fragment key={index}>
                      <button
                        onClick={(e) => handleStyleClick(style, e)}
                        className="hover:underline"
                      >
                        {style}
                      </button>
                      {index < array.length - 1 && ", "}
                    </React.Fragment>
                  ))}
                </div>
              )}
              <CategoryDropdown songId={song.id} />
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleNewSong}
        className={`w-full bg-[${theme.common.brown}] text-[${theme.common.white}] py-2 px-4 rounded hover:opacity-80`}
      >
        New Song
      </button>
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className={`flex items-center text-sm text-[${theme.common.white}] hover:text-[${theme.common.brown}]`}
        >
          {showCategories ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
          {showCategories ? 'Hide Categories' : 'Show Categories'}
        </button>
        <button
          onClick={() => setShowStyles(!showStyles)}
          className={`flex items-center text-sm text-[${theme.common.white}] hover:text-[${theme.common.brown}]`}
        >
          {showStyles ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
          {showStyles ? 'Hide Styles' : 'Show Styles'}
        </button>
      </div>
      <DeleteConfirmationDialog />
    </div>
  );
}

export default SongList;