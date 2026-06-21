import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('miv_theme');
  if (saved) return saved;
  // default to dark mode for Apple 2026 feel
  return 'dark';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: getInitialTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('miv_theme', state.mode);
      
      // Update DOM class list
      if (state.mode === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    },
    initializeThemeDom: (state) => {
      if (state.mode === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  },
});

export const { toggleTheme, initializeThemeDom } = themeSlice.actions;
export default themeSlice.reducer;
