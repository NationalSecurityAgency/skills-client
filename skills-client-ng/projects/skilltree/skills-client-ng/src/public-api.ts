/*
Copyright 2020 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
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