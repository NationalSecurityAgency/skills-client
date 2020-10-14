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

import SkillsDisplay from '@/component/SkillsDisplay.vue';
import { SkillsDisplayJS } from '@skilltree/skills-client-js';

import { shallowMount } from '@vue/test-utils';

describe('SkillsDisplay', () => {
  beforeEach(() => {
    SkillsDisplayJS.mockClear();
  });

  it('exists and is a vue component', () => {
    const component = shallowMount(SkillsDisplay);
    expect((component).vm).toBeTruthy()
  });

  describe('destructing', () => {
    it('should call destroy on the clientDisplay', () => {
      const component = shallowMount(SkillsDisplay);
      expect(component.vm.clientDisplay.destroy).not.toHaveBeenCalled();
      component.destroy();
      expect(component.vm.clientDisplay.destroy).toHaveBeenCalledTimes(1);
    });
  });

  it('when version is updated, clientDisplay is updated with the new version', async () => {
    const component = shallowMount(SkillsDisplay, {
      propsData: {
        version: 1,
      },
    });

    expect(component.props().version).toBe(1);

    await component.setProps({ version: 5 });

    const mockSkillsDisplayInstance = SkillsDisplayJS.mock.instances[0];

    expect(mockSkillsDisplayInstance.version).toBe(5)
  });

  describe('props', () => {
    describe('options prop', () => {
      let validatorFunction;
      let supportedOptionsObject;
      let component;

      beforeEach(() => {
        component = shallowMount(SkillsDisplay);
        validatorFunction = component.vm.$options.props.options.validator;
        supportedOptionsObject = {
          'authenticator': Math.random(),
          'serviceUrl': Math.random(),
          'projectId': Math.random(),
          'disableAutoScroll': Math.random(),
          'autoScrollStrategy': Math.random(),
          'isSummaryOnly': Math.random(),
        };
      });

      it('options prop accepts supported options', () => {
        const result = validatorFunction(supportedOptionsObject);
        expect(result).toBeTruthy();
      });

      it('fails if an invalid option is passed', () => {
        supportedOptionsObject[`IamAnInvalidOption${Math.random()}`] = Math.random();
        const result = validatorFunction(supportedOptionsObject);
        expect(result).toBeFalsy();
      });
    });
  });
});
