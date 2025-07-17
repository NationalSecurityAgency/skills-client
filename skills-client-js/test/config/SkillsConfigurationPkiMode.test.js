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
import SkillsConfiguration from '../../src/config/SkillsConfiguration';

/**
 * @jest-environment jsdom
 */
describe('SkillsConfigurationPkiMode', () => {
    const flushPromises = () => new Promise(setImmediate);
    const mockStatusResponse = '{"status":"OK","clientLib":{"loggingEnabled":"false","loggingLevel":"DEBUG"}}';
    const mockVersionResponse = '{"success":true,"explanation":null}';
    let statusReqCount = 0;

    // replace the real XHR object with the mock XHR object before each test
    beforeEach(() => {
        mock.setup();
        SkillsConfiguration.logout();
        const url = /.*\/api\/projects\/.*\/skillsClientVersion/;
        mock.post(url, (req, res) => res.status(200).body(mockVersionResponse));
        mock.get(/.*\/public\/status/, (req, res) => {
            statusReqCount++;
            return res.status(200).body(mockStatusResponse);
        });
    });

    // put the real XHR object back and clear the mocks after each test
    afterEach(() => {
        SkillsConfiguration.logout();
        mock.teardown();
        statusReqCount = 0;
    });

    it('isPKIMode is false if authenticator is NOT \'pki\'', async () => {
        const mockAuthenticator = Math.random().toString();
        mock.get(mockAuthenticator, (req, res) => res.status(200).body('{"access_token": "token"}'));
        SkillsConfiguration.configure({
            authenticator: mockAuthenticator, projectId: 'proj', serviceUrl: 'http://somewhere',
        });
        await new Promise(process.nextTick);

        expect(SkillsConfiguration.isPKIMode()).toBeFalsy();
    });

    it('isPKIMode is true if authenticator is \'pki\'', async () => {
        const mockAuthenticator = 'pki';

        SkillsConfiguration.configure({
            authenticator: mockAuthenticator, projectId: 'proj', serviceUrl: 'http://somewhere',
        });
        await new Promise(process.nextTick);

        expect(SkillsConfiguration.isPKIMode()).toBeTruthy();
    });

});
