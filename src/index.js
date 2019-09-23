import SkillsDirective from './directive/SkillsReporterDirective';
import SkillsDisplay from './component/SkillsDisplay.vue';
import SkillsConfiguration from '@skills/skills-client-configuration';
import SkillsReporter from '@skills/skills-client-reporter';
import SkillsClientNative from '@skills/skills-client-native';
import SkillsLevel from './component/SkillsLevel.vue';

const install = (Vue) => {
  Vue.directive('skills', SkillsDirective);
};

if (window.Vue) {
  window.SkillsDirective = SkillsDirective;
  Vue.use(install);
}

SkillsDirective.install = install;

export {
  SkillsDirective,
  SkillsDisplay,
  SkillsLevel,
  SkillsConfiguration,
  SkillsReporter,
  SkillsClientNative,
};

