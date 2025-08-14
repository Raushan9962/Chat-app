// src/store/useThemeStore.js
import { create } from "zustand";
import { THEMES } from "../constants/themes.js";

const getSavedTheme = () => {
  if (typeof window === "undefined") return THEMES[0];
  
  try {
    const saved = localStorage.getItem("chat-theme");
    return saved && THEMES.includes(saved) ? saved : THEMES[0];
  } catch {
    return THEMES[0];
  }
};

export const useThemeStore = create((set, get) => {
  const initialTheme = getSavedTheme();
  
  // Apply initial theme immediately
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", initialTheme);
  }

  return {
    theme: initialTheme,
    setTheme: (themeName) => {
      if (!THEMES.includes(themeName)) return;
      
      // Apply theme to document immediately - DaisyUI handles colors automatically
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", themeName);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem("chat-theme", themeName);
      } catch (e) {
        console.warn("Failed to save theme to localStorage:", e);
      }
      
      // Update store
      set({ theme: themeName });
    },
    toggleTheme: () => {
      const current = get().theme;
      const currentIndex = THEMES.indexOf(current);
      const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
      get().setTheme(nextTheme);
    },
  };
});
