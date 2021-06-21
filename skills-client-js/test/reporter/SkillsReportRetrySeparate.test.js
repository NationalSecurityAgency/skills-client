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
import mock from 'xhr-mock';
import SkillsConfiguration from '../../src/config/SkillsConfiguration';
import { SkillsReporter } from '../../src/reporter/SkillsReporter';

require('@babel/polyfill');

describe('retryTests2()', () => {
  const mockServiceUrl = 'http://some.com';
  const mockProjectId = 'proj1';
  const authEndpoint = `${mockServiceUrl}/auth/endpoint`;

  // replace the real XHR object with the mock XHR object before each test
  beforeEach(() => {
    console.log('beforeEach!!');
    mock.setup();
    SkillsConfiguration.logout();
    SkillsReporter.configure( { retryInterval: 60 } );
    const url = /.*\/api\/projects\/proj1\/skillsClientVersion/;
    mock.post(url, (req, res) => res.status(200).body('{"success":true,"explanation":null}'));
    mock.get(/.*\/public\/status/, (req, res) => res.status(200).body('{"status":"OK","clientLib":{"loggingEnabled":"false","loggingLevel":"DEBUG"}}'));
  });

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => {
    console.log('afterEach!!');
    SkillsConfiguration.logout();
    mock.teardown();
  });

  it('reportSkill will not retry when errorCode === SkillNotFound', async () => {
    SkillsConfiguration.logout();
    expect.assertions(3);
    const mockUserSkillId = 'skill1';

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    const handler1 = jest.fn();
    const mockError = JSON.stringify({"explanation":"Failed to report skill event because skill definition does not exist.","errorCode":"SkillNotFound","success":false,"projectId":"movies","skillId":"DoesNotExist","userId":"user1"});
    let body = mockError;
    let status = 403;

    SkillsReporter.addErrorHandler(handler1);

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      return res.status(status).body(body);
    });

    try {
      await SkillsReporter.reportSkill('skill1');
    } catch (e) {
    }
    // sleep for 3 seconds
    await new Promise(r => setTimeout(r, 3000));
    expect(count).toEqual(1);
    expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));
  });

});
