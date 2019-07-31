import SkillsDirective from './directive/SkillsReporterDirective';
import SkillsDisplay from './component/SkillsDisplay.vue';
import SkillsConfiguration from '@skills/skills-client-configuration';
import SkillsReporter from '@skills/skills-client-reporter';

const install = (Vue) => {
  Vue.directive('skills', SkillsDirective);
};

if (window.Vue) {
  window.SkillsDirective = SkillsDirective;
  Vue.use(install);
}

SkillsDirective.install = install;

export { SkillsDirective, SkillsDisplay, SkillsConfiguration, SkillsReporter };

