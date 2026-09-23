/*
 * Copyright 2026 SkillTree
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
require("@babel/polyfill");
import mock from 'xhr-mock';
import SkillsConfiguration from '../../src/config/SkillsConfiguration';
import { SkillsReporter } from '../../src/reporter/SkillsReporter.js';

// These tests exercise HTTP authentication, not the background websocket connection.
jest.mock('@stomp/stompjs');

describe('authPkiTests()', () => {
  const mockServiceUrl = 'http://some.com';
  const mockProjectId = 'proj1';

  // replace the real XHR object with the mock XHR object before each test
  beforeEach(async () => {
    mock.setup();
    SkillsConfiguration.logout();
    mock.get(/.*\/public\/status/, (req, res) => res.status(200).body('{"status":"OK","clientLib":{"loggingEnabled":"false","loggingLevel":"DEBUG"}}'));
    mock.post(/.*\/api\/projects\/proj1\/skillsClientVersion/, (req, res) => res.status(200).body('{"success":true,"explanation":null}'));
    await SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: 'pki',
    });
  });

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => {
    SkillsReporter.cancelRetryChecker();
    window.localStorage.removeItem('skillTreeRetryQueue');
    SkillsConfiguration.logout();
    mock.teardown();
  });

  it('successful call in pki mode', async () => {
    expect.assertions(2);
    const mockUserSkillId = 'skill1';
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toBeNull();
      return res.status(200).body('{"data":{"id":"abc-123"}}');
    });

    const res = await SkillsReporter.reportSkill('skill1');
    expect(res).toEqual({ data: {id: 'abc-123'} });
  });

  it('do not attempt to re-auth in pki mode', async () => {
    expect.assertions(2);
    const handler1 = jest.fn();
    SkillsReporter.addErrorHandler(handler1);
    const mockUserSkillId = 'skill1';
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toBeNull();
      return res.status(401).body('{"data":{"error":"true"}}');
    });

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {}
    expect(handler1).toHaveBeenCalledWith({ data: {error: 'true'} });
  });

  // it('should resolve with some data when status=201', async () => {
  //   expect.assertions(1);
  //
  //   mock.post('/api/user', {
  //     status: 201,
  //     reason: 'Created',
  //     body: '{"data":{"id":"abc-123"}}'
  //   });
  //
  //   const user = await createUser({name: 'John'});
  //
  //   expect(user).toEqual({id: 'abc-123'});
  // });
  //
  // it('should reject with an error when status=400', async () => {
  //   expect.assertions(1);
  //
  //   mock.post('/api/user', {
  //     status: 400,
  //     reason: 'Bad request',
  //     body: '{"error":"A user named \\"John\\" already exists."}'
  //   });
  //
  //   try {
  //     const user = await createUser({name: 'John'});
  //   } catch (error) {
  //     expect(error).toMatch('A user named "John" already exists.');
  //   }
  // });
});
