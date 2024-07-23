export const loadSongsFromLocalStorage = () => {
  const songs = localStorage.getItem('songs');
  return songs ? JSON.parse(songs) : [];
};

export const saveSongsToLocalStorage = (songs) => {
  localStorage.setItem('songs', JSON.stringify(songs));
};