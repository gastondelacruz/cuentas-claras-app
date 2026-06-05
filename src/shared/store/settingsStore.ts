import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Language = 'es' | 'en';

type SettingsStore = {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
};

export const useSettingsStore = create<SettingsStore>()((set) => ({
  theme: 'light',
  language: 'es',
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));
