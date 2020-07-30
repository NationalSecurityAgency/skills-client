/*
 * Public API Surface of skills-client-ng
 */
import { APP_VERSION } from './version';
SkillsConfiguration.skillsClientVersion = APP_VERSION;

import {
  SkillsConfiguration,
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT,
  SkillsDisplayJS
} from '@skilltree/skills-client-js';

export {
  SkillsConfiguration,
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT,
  SkillsDisplayJS,
};

export * from './lib/components/skills-level.module';
export * from './lib/components/skills-level.component';

export * from './lib/components/skills-display.module';
export * from './lib/components/skills-display.component';

export * from './lib/directives/skilltree/skilltree.module';
export * from './lib/directives/skilltree/skilltree.directive';