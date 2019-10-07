import SkillsDirective from './directive/SkillsReporterDirective';
import SkillsDisplay from './component/SkillsDisplay.vue';
import SkillsLevel from './component/SkillsLevel.vue';
import SkillsConfiguration from '@skills/skills-client-configuration';
import { SkillsReporter, SUCCESS_EVENT, FAILURE_EVENT } from '@skills/skills-client-reporter';
import { SkillsDisplayJS } from '@skills/skills-client-js';

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
  SUCCESS_EVENT,
  FAILURE_EVENT,
  SkillsDisplayJS,
};

