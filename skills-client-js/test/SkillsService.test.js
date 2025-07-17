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
import mock from 'xhr-mock';
import SkillsService from '../src/SkillsService';

require('@babel/polyfill');

describe('OAuth auto redirect tests', () => {
  const mockServiceUrl = 'http://some.com';
  const mockProjectId = 'proj1';
  const authEndpoint = `${mockServiceUrl}/oauth2/authorization/gitlab`;
  const oldWindowLocation = window.location

  /**
   * Please note that this test will need to be re-written in order to upgrade
   * jest-environment-jsdom from 29 to 30; version 30 does not support manipulating
   * `window.location`, here are some relevant tickets:
   *   https://github.com/jestjs/jest/issues/15674
   *   https://github.com/jsdom/jsdom/issues/3492
   */
  beforeAll(() => {
    delete window.location

    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: jest.fn(),
        },
      },
    )
  })
  afterAll(() => {
    // restore `window.location` to the `jsdom` `Location` object
    window.location = oldWindowLocation
  })

  // replace the real XHR object with the mock XHR object before each test
  beforeEach(() => {
    mock.setup();
    // const url = /.*\/api\/projects\/proj1\/skillsClientVersion/;
    window.location.assign.mockReset()
  });

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => {
    mock.teardown();
  });

  it('oauth auto redirects when oauthRedirect=true', async () => {
    const oauthTokenEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/token`;
    mock.get(oauthTokenEndpoint, (req, res) => res.status(401));

    await SkillsService.getAuthenticationToken(authEndpoint, mockServiceUrl, mockProjectId, true);

    expect(window.location.assign).toHaveBeenCalledTimes(1)
    expect(window.location.assign).toHaveBeenCalledWith(`${authEndpoint}?skillsRedirectUri=http://localhost/`)
  });

  it('oauth does not auto redirect when oauthRedirect=false', async () => {
    const oauthTokenEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/token`;
    mock.get(oauthTokenEndpoint, (req, res) => res.status(401));

    try {
      await SkillsService.getAuthenticationToken(authEndpoint, mockServiceUrl, mockProjectId);
    } catch (e) {
      expect(e.message).toMatch('Unable to authenticate');
      expect(window.location.assign).toHaveBeenCalledTimes(0);
    }
  });

  it('oauth does not auto redirect when oauthRedirect=true but token is returned', async () => {
    const oauthTokenEndpoint = `${mockServiceUrl}/api/projects/${mockProjectId}/token`;
    mock.get(oauthTokenEndpoint, (req, res) => res.status(200).body('{"access_token": "token1"}'));

    const result = await SkillsService.getAuthenticationToken(authEndpoint, mockServiceUrl, mockProjectId, true);
    expect(window.location.assign).toHaveBeenCalledTimes(0);
    expect(result).toMatch('token1');
  });

});
