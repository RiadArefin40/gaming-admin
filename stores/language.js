import { defineStore } from 'pinia';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    language: (process.client && sessionStorage.getItem('preferredLanguage')),
  }),
  actions: {
    setLanguage(lang) {
      this.language = lang;
      if (process.client) {
        sessionStorage.setItem('preferredLanguage', lang);
      }
    },
  },
});
