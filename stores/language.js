import { defineStore } from 'pinia';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    language: (process.client && localStorage.getItem('preferredLanguage')),
  }),
  actions: {
    setLanguage(lang) {
      this.language = lang;
      if (process.client) {
        localStorage.setItem('preferredLanguage', lang);
      }
    },
  },
});
