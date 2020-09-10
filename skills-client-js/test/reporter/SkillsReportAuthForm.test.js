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
require("@babel/polyfill");
import mock, {sequence} from 'xhr-mock';
import SkillsConfiguration from '../../src/config/SkillsConfiguration';
import { SkillsReporter } from '../../src/reporter/SkillsReporter.js';

describe('authFormTests()', () => {
  const mockServiceUrl = 'http://some.com';
  const mockProjectId = 'proj1';
  const authEndpoint = `${mockServiceUrl}/auth/endpoint`;

  // replace the real XHR object with the mock XHR object before each test
  beforeEach(() => {
    mock.setup();
    SkillsConfiguration.logout();
    const url = /.*\/api\/projects\/proj1\/skillsClientVersion/;
    mock.post(url, (req, res) => {
      return res.status(200).body('{"success":true,"explanation":null}');
    });
    mock.get(/.*\/public\/status/, (req, res) => {
      return res.status(200).body('{"loggingEnabled":false}');
    });
  });

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => {
    SkillsConfiguration.logout();
    mock.teardown();
  });

  it('successful call', async () => {
    expect.assertions(2);
    const mockUserSkillId = 'skill1';

    mock.get(authEndpoint, (req, res) => {
      return res.status(200).body('{"access_token": "token"}');
    });
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      return res.status(200).body('{"data":{"id":"abc-123"}}');
    });

    const res = await SkillsReporter.reportSkill('skill1');
    expect(res).toEqual({ data: {id: 'abc-123'} });
  });

  it('re-try auth if 401k status', async () => {
    let count = 0;
    mock.get(authEndpoint, (req, res) => {
      count++;
      return res.status(200).body('{"access_token": "token"}');
    });
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });

    const mockUserSkillId = 'skill1';
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    mock.post(url, sequence([
        { status: 401, body: '{"data":{"error":"true"}}' },
        { status: 401, body: '{"data":{"error":"true"}}' },
        { status: 200, body: '{"data":{"id":"abc-123"}}' },
      ]
    ));

    const res = await SkillsReporter.reportSkill('skill1');
    expect(res).toEqual({ data: {id: 'abc-123'} });
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it('unable to auth because of non 200 status code', async () => {
    expect.assertions(1);
    mock.get(authEndpoint, (req, res) => {
      return res.status(401).body('{"access_token": "token"}');
    });
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });

    const mockUserSkillId = 'skill1';
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    mock.post(url, (req, res) => {
      return res.status(200).body('{"data":{"id":"abc-123"}}');
    });
    try {
      await SkillsReporter.reportSkill('skill1');
    } catch (e) {
      expect(e.message,).toMatch('Unable to authenticate');
    }
  });

  it('unable to auth because access_token is missing', async () => {
    expect.assertions(1);

    mock.get(authEndpoint, (req, res) => {
      return res.status(200).body('{"not_access_token": "token"}');
    });
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });

    const mockUserSkillId = 'skill1';
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    mock.post(url, (req, res) => {
      return res.status(200).body('{"data":{"id":"abc-123"}}');
    });

    try {
      await SkillsReporter.reportSkill('skill1');
    } catch (e) {
      expect(e.message,).toMatch('Unable to authenticate');
    }
  });

  it('report skill fails after re-auth worked', async () => {
    let count = 0;
    mock.get(authEndpoint, (req, res) => {
      count++;
      if (count > 1) {
        // this will cause report skill to fail
        SkillsConfiguration.serviceUrl = undefined;
      }
      return res.status(200).body('{"access_token": "token"}');
    });
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });

    const mockUserSkillId = 'skill1';
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;

    mock.post(url, sequence([
        { status: 401, body: '{"data":{"error":"true"}}' },
      ]
    ));

    try {
      await SkillsReporter.reportSkill('skill1');
    } catch (e) {
      expect(e.message,).toMatch('SkillTree: SkillsConfiguration was not configured and serviceUrl, projectId and authenticationUrl are missing.');
    }
  });

  it('do not re-auth forever', async () => {
    let count = 0;
    mock.get(authEndpoint, (req, res) => {
      count++;
      return res.status(200).body('{"access_token": "token"}');
    });
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });

    const mockUserSkillId = 'skill1';
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;

    mock.post(url, (req, res) => {
      return res.status(401).body('{"data":{"error":"abc-123"}}');
    });

    try {
      await SkillsReporter.reportSkill('skill1');
    } catch (e) {
      expect(e.message).toMatch('Unable to authenticate after 25 attempts');
    }
    expect(count).toEqual(26);
  });

});
