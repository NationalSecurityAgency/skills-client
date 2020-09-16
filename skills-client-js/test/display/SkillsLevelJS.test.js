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
import MockAdapter from 'axios-mock-adapter';
import mock from 'xhr-mock';
import axios from 'axios';
import 'regenerator-runtime/runtime';

import SkillsLevelJS from '../../src/display/SkillsLevelJS';
import SkillsConfiguration from '../../src/config/SkillsConfiguration';
import ErrorPageUtils from '../../src/display/ErrorPageUtils';

jest.mock('../../src/display/ErrorPageUtils.js');

const mockServiceUrl = Math.random();
const mockProjectId = Math.random();
const mockAuthenticator = Math.random();
const mockAuthToken = Math.random();
const mockSkillLevel = Math.random();

describe('SkillsLevelJS', () => {
  let mockHttp;
  // let initialSkillLevelPromise;
  beforeEach(() => {
    mockHttp = new MockAdapter(axios);
    ErrorPageUtils.removeAllChildren.mockClear();
    ErrorPageUtils.buildErrorPage.mockClear();

    mockHttp.onGet(new RegExp(`api/projects/${mockProjectId}/level.*`)).reply(200, mockSkillLevel);
    mock.setup();
    mock.get(/.*\/public\/status/, (req, res) => res.status(200).body('{"status":"OK","clientLib":{"loggingEnabled":"false","loggingLevel":"DEBUG"}}'));
    mock.post(/.*\/api\/projects\/.*\/skillsClientVersion/, (req, res) => res.status(200).body('{"success":true,"explanation":null}'));

    SkillsConfiguration.configure({
      projectId: mockProjectId,
      serviceUrl: mockServiceUrl,
      authenticator: mockAuthenticator,
      authToken: mockAuthToken,
    });
  });

  it('is found', () => {
    expect(SkillsLevelJS).toBeDefined();
  });

  describe('attachTo', () => {
    let realDocument;

    beforeEach(() => {
      realDocument = global.document;
      global.document.querySelector = jest.fn();
    });

    afterEach(() => {
      global.document = realDocument;
    });

    it('throws an error if element to attach to does not exist', () => {
      const skillsLevelJS = new SkillsLevelJS(null);

      global.document.querySelector = jest.fn(() => null);

      const mockSelector = `#${Math.random()}`;
      expect(() => {
        skillsLevelJS.attachTo(mockSelector);
      }).toThrow(`Can't find element with selector='${mockSelector}'`);

      expect(() => {
        skillsLevelJS.attachTo(null);
      }).toThrow(`Can't find element with selector='${null}'`);
    });
  });

  describe('update - SkillsReporter event handler', () => {
    const flushPromises = () => new Promise((resolve) => setTimeout(resolve));
    let mockBaseResponse;

    beforeEach(() => {
      mockBaseResponse = {
        success: true,
        skillApplied: true,
        explanation: 'Skill event was applied',
        completed: [],
      };
    });

    it('doesnt do anything if there are no overall skill level updates reported', async () => {
      mockBaseResponse.completed.push({
        type: 'Subject',
        level: 1,
        id: 'action',
        name: 'Action / Adventure',
      },
      {
        type: 'Subject',
        level: 2,
        id: 'action',
        name: 'Action / Adventure',
      });

      global.document.querySelector = jest.fn(() => global.document.createElement('div'));
      const skillsLevelJS = new SkillsLevelJS(null);
      const selector = '#skillsLevel';
      skillsLevelJS.attachTo(selector);
      await flushPromises();

      expect(skillsLevelJS.skillLevel).toBe(mockSkillLevel);
      skillsLevelJS.update(mockBaseResponse);
      expect(skillsLevelJS.skillLevel).toBe(mockSkillLevel);
    });

    it('updates this.skillLevel to highest level attained from event', async () => {
      mockBaseResponse.completed.push({
        type: 'Subject',
        level: 1,
        id: 'action',
        name: 'Action / Adventure',
      },
      {
        type: 'Subject',
        level: 2,
        id: 'action',
        name: 'Action / Adventure',
      },
      {
        type: 'Overall',
        level: 2,
        id: 'OVERALL',
        name: 'OVERALL',
      },
      {
        type: 'Overall',
        level: 4,
        id: 'OVERALL',
        name: 'OVERALL',
      },
      {
        type: 'Overall',
        level: 3,
        id: 'OVERALL',
        name: 'OVERALL',
      });

      global.document.querySelector = jest.fn(() => global.document.createElement('div'));
      const skillsLevelJS = new SkillsLevelJS(null);
      const selector = '#skillsLevel';
      skillsLevelJS.attachTo(selector);
      await flushPromises();
      expect(skillsLevelJS.skillLevel).toBe(mockSkillLevel);
      skillsLevelJS.update(mockBaseResponse);

      expect(skillsLevelJS.skillLevel).toBe(4);
    });

    it('doesnt blow up if completed events is null', () => {
      mockBaseResponse.completed = null;
      global.document.querySelector = jest.fn(() => global.document.createElement('div'));
      const skillsLevelJS = new SkillsLevelJS(null);
      const selector = '#skillsLevel';
      skillsLevelJS.attachTo(selector);
      skillsLevelJS.update(mockBaseResponse);
    });
  });
});
