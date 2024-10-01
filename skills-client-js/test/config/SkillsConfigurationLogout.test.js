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

/**
 * @jest-environment jsdom
 */
describe('SkillsConfiguration', () => {
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

    it('reinitializes the afterConfigure promise', () => {
        const oldPromise = SkillsConfiguration.afterConfigure();

        SkillsConfiguration.logout();

        const newPromise = SkillsConfiguration.afterConfigure();

        expect(oldPromise).not.toBe(newPromise);
    });

    it('clears the authToken', async () => {
        const mockAuthToken = Math.random().toString();
        ;
        SkillsConfiguration.configure({
            authToken: mockAuthToken,
            projectId: 'proj',
            serviceUrl: 'http://some',
            authenticator: 'http://auth',
        });
        await new Promise(process.nextTick);

        expect(SkillsConfiguration.getAuthToken()).toBe(mockAuthToken);

        SkillsConfiguration.logout();

        expect(SkillsConfiguration.getAuthToken()).toBe(null);
    });
});
