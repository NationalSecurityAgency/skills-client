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
jest.mock('@skills/skills-client-reporter');
jest.mock('@skills/skills-client-configuration');
jest.mock('@/component/SkillsLevelService');

import SkillsLevel from '@/component/SkillsLevel';
import SkillsConfiguration from '@skills/skills-client-configuration';
import SkillsLevelService from '@/component/SkillsLevelService.js';
import { SkillsReporter } from '@skills/skills-client-reporter';

import { shallowMount } from '@vue/test-utils';

describe('SkillsLevel', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    SkillsReporter.addSuccessHandler.mockClear();
    SkillsLevelService.getSkillLevel.mockClear();
    SkillsConfiguration.getProjectId.mockClear();
    SkillsLevelService.getSkillLevel.mockImplementation(() => new Promise(() => { }));
    SkillsConfiguration.afterConfigure.mockImplementation(() => new Promise(() => { }))
  });

  it('exists and is a vue instance', () => {
    const component = shallowMount(SkillsLevel);
    expect(component.isVueInstance()).toBeTruthy();
  });

  describe('created hook', () => {
    it('exists', () => {
      expect(SkillsLevel.created).toBeDefined();
    });

    it('Adds the SkillsReporter success handler to update level', () => {
      // I can't figure out how to test that the update method was passed as an argument :(
      // So I am just checking SkillsReporter.addSuccessHandler was called...
      // const mockUpdated = jest.fn();
      // const component = shallowMount(SkillsLevel, {
      //   methods: {
      //     update: mockUpdated,
      //   }
      // });
      // expect(SkillsReporter.addSuccessHandler).toHaveBeenCalledWith(mockUpdated);
      shallowMount(SkillsLevel);
      expect(SkillsReporter.addSuccessHandler).toHaveBeenCalled();
    });
  });

  describe('projectId', () => {
    it('if projectId isnt supplied as a prop, SkillsConfiguration is used', () => {
      const mockProjectId = Math.random();
      SkillsConfiguration.getProjectId.mockReturnValue(mockProjectId);

      const vm = shallowMount(SkillsLevel).vm;

      const resultProjectId = vm.getProjectId();
      expect(mockProjectId).toBe(resultProjectId);
    });

    it('uses the prop if it is passed', () => {
      const mockProjectId = Math.random();
      SkillsConfiguration.getProjectId.mockReturnValue(mockProjectId);

      const expectedProjectId = `Project2-${Math.random()}`;

      const vm = shallowMount(SkillsLevel, {
        propsData: {
          projectId: expectedProjectId,
        }
      }).vm;

      const result = vm.getProjectId();
      expect(result).toBe(expectedProjectId);
    });
  });

  describe('shallowMounted hook', () => {
    it('initializes the users skillLevel', (done) => {
      const mockSkillLevel = Math.random();
      SkillsConfiguration.afterConfigure.mockResolvedValue();
      SkillsLevelService.getSkillLevel.mockResolvedValue(mockSkillLevel);
      const vm = shallowMount(SkillsLevel).vm;

      vm.$nextTick(() => {
        vm.$nextTick(() => {
          expect(vm.skillLevel).toBe(mockSkillLevel);
          done();
        });
      });
    });
  });

  describe('update - SkillsReporter event handler', () => {
    let mockBaseResponse;

    beforeEach(() => {
      mockBaseResponse = {
        "success": true,
        "skillApplied": true,
        "explanation": "Skill event was applied",
        "completed": [],
      };
    });

    it('doesnt do anything if there are no overall skill level updates reported', () => {
      mockBaseResponse.completed.push({
          "type": "Subject",
          "level": 1,
          "id": "action",
          "name": "Action / Adventure"
        },
        {
          "type": "Subject",
          "level": 2,
          "id": "action",
          "name": "Action / Adventure"
        },
      );

      const vm = shallowMount(SkillsLevel).vm;
      const mockSkillLevel = Math.random();

      vm.skillLevel = mockSkillLevel;
      vm.update(mockBaseResponse);
      expect(vm.skillLevel).toBe(mockSkillLevel);
    });

    it('updates this.skillLevel to highest level attained from event', () => {
      mockBaseResponse.completed.push({
          "type": "Subject",
          "level": 1,
          "id": "action",
          "name": "Action / Adventure"
        },
        {
          "type": "Subject",
          "level": 2,
          "id": "action",
          "name": "Action / Adventure"
        },
        {
          "type": "Overall",
          "level": 2,
          "id": "OVERALL",
          "name": "OVERALL"
        },
        {
          "type": "Overall",
          "level": 4,
          "id": "OVERALL",
          "name": "OVERALL"
        },
        {
          "type": "Overall",
          "level": 3,
          "id": "OVERALL",
          "name": "OVERALL"
        },
      );

      const vm = shallowMount(SkillsLevel).vm;

      vm.skillLevel = 0;
      vm.update(mockBaseResponse);
      expect(vm.skillLevel).toBe(4);
    });

    it('doesnt blow up if completed events is null', () => {
      mockBaseResponse.completed = null;
      const vm = shallowMount(SkillsLevel).vm;
      vm.update(mockBaseResponse);
    });
  });

  describe('rendering', () => {
    it('only renders once skillsLevel is initialized', () => {
      const wrapper = shallowMount(SkillsLevel);
      const vm = wrapper.vm;

      const selector = '.skills-level-text-display';

      expect(wrapper.find(selector).exists()).toBe(false);

      wrapper.setData({ skillLevel: 1 });

      expect(wrapper.find(selector).exists()).toBe(true);
    });
  });
});
