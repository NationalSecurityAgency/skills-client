/*
 * Copyright 2020 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
jest.mock('@skilltree/skills-client-js');
jest.mock('@/component/SkillsLevelService');

import SkillsLevel from '@/component/SkillsLevel';
import { SkillsConfiguration } from '@skilltree/skills-client-js';

import { shallowMount } from '@vue/test-utils';

describe('SkillsLevel', () => {
  describe('rendering', () => {
    it('only renders once skillsLevel is initialized', async () => {
      SkillsConfiguration.afterConfigure.mockImplementation(() => new Promise(() => { }))
      const wrapper = shallowMount(SkillsLevel);
      const selector = '.skills-level-text-display';

      expect(wrapper.find(selector).isVisible()).toBe(false);

      await wrapper.setData({ skillLevel: 1 });

      expect(wrapper.find(selector).isVisible()).toBe(true);
    });
  });
});
