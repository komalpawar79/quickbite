import { create } from 'zustand';

const useThemeStore = create((set) => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  return {
    theme: savedTheme,

    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
        
        return { theme: newTheme };
      });
    },

    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      set({ theme });
    },
  };
});

export default useThemeStore;
