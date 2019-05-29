import SkillsDirective from './directive/SkillsReporterDirective';
import SkillsDisplay from './component/SkillsDisplay.vue';

const install = (Vue) => {
  Vue.SkillsReporterDirective('skills', SkillsDirective);
};

if (window.Vue) {
  window.SkillsDirective = SkillsDirective;
  Vue.use(install);
}

SkillsDirective.install = install;

export { SkillsDirective, SkillsDisplay };
