# Lyrical Genius

Lyrical Genius is a web application designed to help songwriters create, edit, and organize their lyrics with ease. It offers a user-friendly interface for managing song sections, applying styles, and previewing formatted lyrics.

## Features

- Create and edit multiple songs
- Organize lyrics into customizable sections (verse, chorus, bridge, etc.)
- Apply and manage song styles (genre, mood, instruments, vocals)
- Live preview of formatted lyrics
- Dark mode support
- Local storage for saving progress
- Responsive design for mobile compatibility

## Tech Stack

- React.js
- Redux for state management
- Tailwind CSS for styling
- Lucide React for icons

## Project Structure

```
lyrical-genius/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Sidebar.js
│   │   ├── SearchableDropdown.js
│   │   ├── DropdownPortal.js
│   │   ├── CategorizedDropdown.js
│   │   ├── AddSectionButton.js
│   │   ├── MetadataSection.js
│   │   ├── Section.js
│   │   ├── LyricsEditor.js
│   │   ├── LivePreview.js
│   │   ├── Toolbar.js
│   │   └── SongList.js
│   ├── data/
│   │   ├── genres.json
│   │   ├── instruments.json
│   │   ├── moods.json
│   │   └── vocals.json
│   ├── store/
│   │   ├── index.js
│   │   ├── songSlice.js
│   │   └── themeSlice.js
│   ├── styles/
│   │   └── tailwind.css
│   ├── utils/
│   │   ├── localStorage.js
│   │   └── helpers.js
│   ├── App.js
│   ├── theme.js
│   └── index.js
├── .gitignore
├── package.json
├── README.md
└── tailwind.config.js
```

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/lyrical-genius.git
   ```

2. Navigate to the project directory:
   ```
   cd lyrical-genius
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and visit `http://localhost:3000` to view the app.

## Usage

1. Create a new song or select an existing one from the sidebar.
2. Add song sections using the "+" button between sections.
3. Edit lyrics within each section.
4. Apply styles using the dropdowns in the metadata section.
5. Preview your formatted lyrics in the right sidebar.
6. Use the toolbar at the bottom for additional actions (e.g., undo).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License



## Acknowledgements

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/darkmistofwoods/lyrical-genius](https://github.com/darkmistofwoods/lyrical-genius)
