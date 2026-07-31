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
import mock from 'xhr-mock';
import SkillsService from '../src/SkillsService';
import log from 'js-logger';

require('@babel/polyfill');

describe('OAuth auto redirect tests', () => {
  const mockServiceUrl = 'http://some.com';
  const mockProjectId = 'proj1';
  const authEndpoint = `${mockServiceUrl}/oauth2/authorization/gitlab`;

  beforeAll(() => {
    SkillsService.assignWindowLocation = jest.fn();
  })

  beforeEach(() => {
    mock.setup();
    SkillsService.assignWindowLocation.mockReset()
  });

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => {
    mock.teardown();
  });

  it('oauth auto redirects when oauthRedirect=true', async () => {
    const oauthTokenEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/token`;
    mock.get(oauthTokenEndpoint, (req, res) => res.status(401));

    await SkillsService.getAuthenticationToken(authEndpoint, mockServiceUrl, mockProjectId, true);

    expect(SkillsService.assignWindowLocation).toHaveBeenCalledTimes(1)
    expect(SkillsService.assignWindowLocation).toHaveBeenCalledWith(`${authEndpoint}?skillsRedirectUri=${encodeURIComponent('http://localhost/')}`)
  });

  it('oauth redirect encodes the current location so it cannot add query parameters', async () => {
    const oauthTokenEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/token`;
    mock.get(oauthTokenEndpoint, (req, res) => res.status(401));

    window.history.pushState({}, '', '/page?a=1&skillsRedirectUri=http://evil.example.com/');
    const injected = window.location.href;

    await SkillsService.getAuthenticationToken(authEndpoint, mockServiceUrl, mockProjectId, true);

    const [redirectedTo] = SkillsService.assignWindowLocation.mock.calls[0];
    expect(redirectedTo).toBe(`${authEndpoint}?skillsRedirectUri=${encodeURIComponent(injected)}`);
    // the injected separators must not survive as separators
    expect(redirectedTo.split('?')).toHaveLength(2);
    expect(redirectedTo).not.toContain('&skillsRedirectUri=');
  });

  it('oauth does not auto redirect when oauthRedirect=false', async () => {
    const oauthTokenEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/token`;
    mock.get(oauthTokenEndpoint, (req, res) => res.status(401));

    try {
      await SkillsService.getAuthenticationToken(authEndpoint, mockServiceUrl, mockProjectId);
    } catch (e) {
      expect(e.message).toMatch('Unable to authenticate');
      expect(SkillsService.assignWindowLocation).toHaveBeenCalledTimes(0);
    }
  });

  it('oauth does not auto redirect when oauthRedirect=true but token is returned', async () => {
    const oauthTokenEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/token`;
    mock.get(oauthTokenEndpoint, (req, res) => res.status(200).body('{"access_token": "token1"}'));

    const result = await SkillsService.getAuthenticationToken(authEndpoint, mockServiceUrl, mockProjectId, true);
    expect(SkillsService.assignWindowLocation).toHaveBeenCalledTimes(0);
    expect(result).toMatch('token1');
  });

  it('send log message', async () => {
    const logEndpoint = `${mockServiceUrl}/public/log`;
    const testMessage = 'Test log message';
    const testLevel = 'ERROR';

    // Mock the POST request to the log endpoint
    mock.post(logEndpoint, (req, res) => {
      // Verify the request body contains expected data
      expect(req.body()).toContain('message');
      expect(req.body()).toContain(testMessage);
      expect(req.body()).toContain(testLevel);
      return res.status(200).body('{"success": true}');
    });

    const result = await SkillsService.sendLogMessage(mockServiceUrl, [testMessage], { level: testLevel });

    expect(result).toEqual({ success: true });
  });

  it('send log message failure', async () => {
    const logEndpoint = `${mockServiceUrl}/public/log`;
    const testMessage = 'Test log message';
    const testLevel = 'ERROR';

    // Mock a failed response
    mock.post(logEndpoint, (req, res) => res.status(500));

    try {
      await SkillsService.sendLogMessage(mockServiceUrl, [testMessage], { level: testLevel });
      fail('Expected sendLogMessage to throw an error');
    } catch (error) {
      expect(error.message).toContain('Unable to send client log message');
      expect(error.message).toContain('Received status [500]');
    }
  });

  it('configure logging with enabled logging', async () => {
    const logEndpoint = `${mockServiceUrl}/public/log`;
    const testMessage = 'Test log message';

    // Mock the POST request for log message
    mock.post(logEndpoint, (req, res) => res.status(200).body('{"success": true}'));

    const response = {
      clientLib: {
        loggingEnabled: 'true',
        loggingLevel: 'INFO'
      }
    };

    // Mock console.info to capture log output
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

    SkillsService.configureLogging(mockServiceUrl, response);

    // Trigger a log message to test the handler
    log.info(testMessage);

    // Wait for async log message to be sent
    await new Promise(resolve => setTimeout(resolve, 10));

    // Check that our test message was logged
    expect(consoleSpy.mock.calls.some(call =>
        call[0] === testMessage || (Array.isArray(call[0]) && call[0].includes(testMessage))
    )).toBe(true);
    consoleSpy.mockReset();
  });

  it('configure logging with unknown level defaults to INFO and logs warning', async () => {
    const logEndpoint = `${mockServiceUrl}/public/log`;
    const response = {
      clientLib: {
        loggingEnabled: 'true',
        loggingLevel: 'UNKNOWN_LEVEL'
      }
    };

    // Mock the POST request for log message
    mock.post(logEndpoint, (req, res) => res.status(200).body('{"success": true}'));

    // Spy on the logger's warn method instead of console.warn
    const logWarnSpy = jest.spyOn(log, 'warn').mockImplementation();
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

    SkillsService.configureLogging(mockServiceUrl, response);

    // Verify the specific warning message was logged
    expect(logWarnSpy).toHaveBeenCalledWith(
        'SkillsClient::SkillService::Unknown log level [UNKNOWN_LEVEL], defaulting to INFO'
    );

    // Verify that logging still works after defaulting to INFO
    log.info('Test message after defaulting');

    await new Promise(resolve => setTimeout(resolve, 10));

    logWarnSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('reportSkillsClientVersion success', async () => {
    const mockConfig = {
      getServiceUrl: () => mockServiceUrl,
      getProjectId: () => mockProjectId,
      isPKIMode: () => false,
      getAuthToken: () => 'test-token'
    };

    const versionEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/skillsClientVersion`;
    const mockResponse = { success: true, version: '3.6.2' };

    // Mock a successful response (200)
    mock.post(versionEndpoint, (req, res) => res.status(200).body(JSON.stringify(mockResponse)));

    const result = await SkillsService.reportSkillsClientVersion(mockConfig);

    expect(result).toEqual(mockResponse);
  });

  it('reportSkillsClientVersion failure', async () => {
    const mockConfig = {
      getServiceUrl: () => mockServiceUrl,
      getProjectId: () => mockProjectId,
      isPKIMode: () => false,
      getAuthToken: () => 'test-token'
    };

    const versionEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/skillsClientVersion`;

    // Mock a failed response (e.g., 401)
    mock.post(versionEndpoint, (req, res) => res.status(401));

    try {
      await SkillsService.reportSkillsClientVersion(mockConfig);
      fail('Expected reportSkillsClientVersion to throw an error');
    } catch (error) {
      expect(error.message).toBe('Unable to report skillsClientVersion.  Received status [401]');
    }
  });

});
