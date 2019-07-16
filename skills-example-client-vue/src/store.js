import Vue from 'vue';
import Vuex from 'vuex';

import SkillsDisplayThemeFactory from './components/skillsDisplay/ThemeFactory.js';
import router from './router.js';

Vue.use(Vuex);

const getAvailableThemeNames = () => {
  return Object.values(SkillsDisplayThemeFactory).map(it => it.name);
};

const isValidTheme = (themeName) => {
  return themeName && getAvailableThemeNames().some(it => it === themeName)
};

const getSelectedTheme = (state) => {
  let theme = state.skillsDisplayThemeName;
  if (!theme) {
    theme = router.history.current.query.theme;
    if (!isValidTheme(theme)) {
      theme = SkillsDisplayThemeFactory.default.name;
    }
  }
  return Object.values(SkillsDisplayThemeFactory).find(it => it.name === theme);
};

export default new Vuex.Store({
  state: {
    skillsDisplayThemeName: null,
  },
  mutations: {
    skillsDisplayThemeName(state, themeName) {
      state.skillsDisplayThemeName = themeName;
    },
  },
  getters: {
    skillsDisplayTheme(state) {
      return getSelectedTheme(state);
    },
  },
});
