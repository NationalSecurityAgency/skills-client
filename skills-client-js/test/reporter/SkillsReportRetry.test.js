/*
 * Copyright 2025 SkillTree
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
import mock, {sequence} from 'xhr-mock';
import SkillsConfiguration from '../../src/config/SkillsConfiguration';
import { SkillsReporter } from '../../src/reporter/SkillsReporter';

require('@babel/polyfill');

describe('retryTests()', () => {
  const mockServiceUrl = 'http://some.com';
  const mockProjectId = 'proj1';
  const authEndpoint = `${mockServiceUrl}/auth/endpoint`;
  const flushPromises = () => new Promise(setImmediate);

  // replace the real XHR object with the mock XHR object before each test
  beforeEach(() => {
    mock.setup();
    SkillsConfiguration.logout();
    SkillsReporter.configure({ retryInterval: 60 });
    const url = /.*\/api\/projects\/proj1\/skillsClientVersion/;
    mock.post(url, (req, res) => res.status(200).body('{"success":true,"explanation":null}'));
    mock.get(/.*\/public\/status/, (req, res) => res.status(200).body('{"status":"OK","clientLib":{"loggingEnabled":"false","loggingLevel":"DEBUG"}}'));
  });

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => {
    SkillsReporter.cancelRetryChecker();
    window.localStorage.removeItem('skillTreeRetryQueue');
    SkillsConfiguration.logout();
    mock.teardown();
  });

  it('reportSkill will retry for errors', async () => {
    expect.assertions(8);
    const mockUserSkillId = 'skill1-random';

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();
    const handler1 = jest.fn();
    const mockSuccess = '{"data":{"id":"abc-123"}}';
    const mockError = JSON.stringify({
      explanation: 'Some random error occurred.', errorCode: 'RandomError', success: false, projectId: 'movies', skillId: 'IronMan', userId: 'user1',
    });
    let body = mockError;
    let status = 503;

    SkillsReporter.addErrorHandler(handler1);

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    let timestamp = null;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      if (count > 1) {
        const reqBody = JSON.parse(req.body());
        expect(reqBody.isRetry).toEqual(true); // verify that isRetry is set to true
        if (timestamp == null) {
          timestamp = reqBody.timestamp;
        } else {
          expect(timestamp).toEqual(reqBody.timestamp); // verify the timestamp remains the same
        }
      }

      // fail the first two times, then succeed after that
      if (count > 2) {
        body = mockSuccess;
        status = 200;
      }
      return res.status(status).body(body);
    });

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {
    }
    // sleep for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
    expect(count).toEqual(3);
    expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));
  });

  it('reportSkill will not retry on success', async () => {
    expect.assertions(4);
    const mockUserSkillId = 'skill1-success';

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();
    const handler1 = jest.fn();

    SkillsReporter.addErrorHandler(handler1);

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      return res.status(200).body('{"data":{"id":"abc-123"}}');
    });

    const res = await SkillsReporter.reportSkill(mockUserSkillId);
    // sleep for 2 seconds
    await new Promise((r) => setTimeout(r, 2000));
    expect(res).toEqual({ data: { id: 'abc-123' } });
    expect(count).toEqual(1);
    expect(handler1).toHaveBeenCalledTimes(0);
  });

  it('do not exceed the max retry queue size', async () => {
    const maxRetryQueueSize = 2;
    SkillsReporter.configure({ maxRetryQueueSize });

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();

    const mockError = JSON.stringify({
      explanation: 'Some random error occurred - maxRetryQueueSize.', errorCode: 'RandomError', success: false, projectId: 'movies', skillId: 'IronMan', userId: 'user1',
    });
    const url = /.*\/api\/projects\/proj1\/skills\/skill[1-3]/;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      return res.status(503).body(mockError);
    });
    try { await SkillsReporter.reportSkill('skill1'); } catch (e) { }
    try { await SkillsReporter.reportSkill('skill2'); } catch (e) { }
    try { await SkillsReporter.reportSkill('skill3'); } catch (e) { }

    const retryQueue = JSON.parse(window.localStorage.getItem('skillTreeRetryQueue'));
    expect(retryQueue.length).toEqual(maxRetryQueueSize);
    expect(retryQueue.find((item) => item.skillId === 'skill1')).toBeTruthy();
    expect(retryQueue.find((item) => item.skillId === 'skill2')).toBeTruthy();
    expect(retryQueue.find((item) => item.skillId === 'skill3')).toBeFalsy();
  });

  it('do not exceed the max retry attempts size', async () => {
    const maxRetryAttempts = 2;
    SkillsReporter.configure({ retryInterval: 60, maxRetryAttempts });

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();

    const handler1 = jest.fn();
    SkillsReporter.addErrorHandler(handler1);
    const mockUserSkillId = 'skill1-random';
    const mockError = JSON.stringify({
      explanation: 'Some random error occurred - maxRetryAttempts.', errorCode: 'RandomError', success: false, projectId: 'movies', skillId: 'IronMan', userId: 'user1',
    });
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    let timestamp = null;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      if (count > 1) {
        const reqBody = JSON.parse(req.body());
        expect(reqBody.isRetry).toEqual(true); // verify that isRetry is set to true
        if (timestamp == null) {
          timestamp = reqBody.timestamp;
        } else {
          expect(timestamp).toEqual(reqBody.timestamp); // verify the timestamp remains the same
        }
      }
      return res.status(503).body(mockError);
    });

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {
    }
    // sleep for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
    expect(count).toEqual(maxRetryAttempts + 1);  // initial attempt plus 2 retries
    expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));

    const retryQueue = JSON.parse(window.localStorage.getItem('skillTreeRetryQueue'));
    expect(retryQueue).toBeNull();
  });

  it('reportSkill will not retry when errorCode === SkillNotFound', async () => {
    SkillsConfiguration.logout();
    expect.assertions(3);
    const mockUserSkillId = 'skill1-SkillNotFound';

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();
    const handler1 = jest.fn();
    const mockError = JSON.stringify({
      explanation: 'Failed to report skill event because skill definition does not exist.', errorCode: 'SkillNotFound', success: false, projectId: 'movies', skillId: 'DoesNotExist', userId: 'user1',
    });
    const body = mockError;
    const status = 503;

    SkillsReporter.addErrorHandler(handler1);

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      return res.status(status).body(body);
    });

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {
    }
    // sleep for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
    expect(count).toEqual(1);
    expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));
  });


  it('reportSkill will retry for errors when maxRetryAttempts is undefined', async () => {
    SkillsReporter.maxRetryAttempts = undefined;
    expect.assertions(8);
    const mockUserSkillId = 'skill1-random';

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();
    const handler1 = jest.fn();
    const mockSuccess = '{"data":{"id":"abc-123"}}';
    const mockError = JSON.stringify({
      explanation: 'Some random error occurred.', errorCode: 'RandomError', success: false, projectId: 'movies', skillId: 'IronMan', userId: 'user1',
    });
    let body = mockError;
    let status = 503;

    SkillsReporter.addErrorHandler(handler1);

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    let timestamp = null;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      if (count > 1) {
        const reqBody = JSON.parse(req.body());
        expect(reqBody.isRetry).toEqual(true); // verify that isRetry is set to true
        if (timestamp == null) {
          timestamp = reqBody.timestamp;
        } else {
          expect(timestamp).toEqual(reqBody.timestamp); // verify the timestamp remains the same
        }
      }

      // fail the first two times, then succeed after that
      if (count > 2) {
        body = mockSuccess;
        status = 200;
      }
      return res.status(status).body(body);
    });

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {
    }
    // sleep for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
    expect(count).toEqual(3);
    expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));
  });

  it('reportSkill will retry for errors when token is null', async () => {
    let authCount = 0;
    expect.assertions(6);
    const mockUserSkillId = 'skill1-random';

    mock.get(authEndpoint, (req, res) => {
      authCount++;
      if (authCount == 1 || authCount == 4) {
        // first authEndpoint call will be from SkillsConfiguration.configure()
        // fail the next two attempts, then succeed on the fourth
        return res.status(200).body('{"access_token": "token"}');
      } else {
        // return empty response simulating dashboard is unable to respond
        return res;
      }
    });

    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();

    // reset the auth token to null so that reportSkill will attempt to re-authenticate
    SkillsConfiguration.setAuthToken(null)
    const handler1 = jest.fn();
    const mockSuccess = '{"data":{"id":"abc-123"}}';
    let body = mockSuccess;
    let status = 200;

    SkillsReporter.addErrorHandler(handler1);

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      body = mockSuccess;
      status = 200;
      return res.status(status).body(body);
    });

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {}

    // sleep for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));

    // SkillsConfigure.configure(), plus initial reportSkill attempt, plus 2 retries (last one succeeds)
    expect(authCount).toEqual(4);
    expect(count).toEqual(1);
    expect(handler1).toHaveBeenCalledWith(
      expect.objectContaining( { message: expect.stringContaining('Unable to authenticate') })
    );
    expect(handler1).toHaveBeenCalledTimes(2);

    const retryQueue = JSON.parse(window.localStorage.getItem('skillTreeRetryQueue'));
    expect(retryQueue).toBeNull();
  });

  it('reportSkill will retry for errors when 401 is returned when reporting', async () => {
    let authCount = 0;
    expect.assertions(4);
    const mockUserSkillId = 'skill1-random';

    mock.get(authEndpoint, (req, res) => {
      authCount++;
        return res.status(200).body('{"access_token": "token"}');
    });

    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();

    // reset the auth token to null so that reportSkill will attempt to re-authenticate
    // SkillsConfiguration.setAuthToken(null)
    const handler1 = jest.fn();

    SkillsReporter.addErrorHandler(handler1);

    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    mock.post(url, sequence([
      { status: 401, body: '{"data":{"error":"true"}}' },
      { status: 401, body: '{"data":{"error":"true"}}' },
      { status: 200, body: '{"data":{"id":"abc-123"}}' },
    ]));

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {}

    // sleep for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));

    // SkillsConfigure.configure(), plus 2 retries due to 401 responses from first two reportSkill calls
    expect(authCount).toEqual(3);
    expect(handler1).toHaveBeenCalledWith({ data: {error: 'true'} });
    expect(handler1).toHaveBeenCalledTimes(2);
    const retryQueue = JSON.parse(window.localStorage.getItem('skillTreeRetryQueue'));
    expect(retryQueue).toBeNull();
  });

  it('do not exceed the max retry attempts size on auth failures', async () => {
    expect.assertions(9);
    const maxRetryAttempts = 2;
    SkillsReporter.configure({ retryInterval: 60, maxRetryAttempts });

    mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: authEndpoint,
    });
    await flushPromises();

    const handler1 = jest.fn();
    SkillsReporter.addErrorHandler(handler1);
    const mockUserSkillId = 'skill1-random';
    const mockError = JSON.stringify({
      explanation: 'Some random error occurred - maxRetryAttempts.', errorCode: 'RandomError', success: false, projectId: 'movies', skillId: 'IronMan', userId: 'user1',
    });
    const url = `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`;
    let count = 0;
    let timestamp = null;
    mock.post(url, (req, res) => {
      expect(req.header('Authorization')).toEqual('Bearer token');
      count++;
      if (count > 1) {
        const reqBody = JSON.parse(req.body());
        expect(reqBody.isRetry).toEqual(true); // verify that isRetry is set to true
        if (timestamp == null) {
          timestamp = reqBody.timestamp;
        } else {
          expect(timestamp).toEqual(reqBody.timestamp); // verify the timestamp remains the same
        }
      }
      return res.status(401).body(mockError);
    });

    try {
      await SkillsReporter.reportSkill(mockUserSkillId);
    } catch (e) {
    }
    // sleep for 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
    expect(count).toEqual(maxRetryAttempts + 1);  // initial attempt plus 2 retries
    expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));

    const retryQueue = JSON.parse(window.localStorage.getItem('skillTreeRetryQueue'));
    expect(retryQueue).toBeNull();
  });
});

