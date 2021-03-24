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
import {
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT
} from '../../src/reporter/SkillsReporter.js';

import SkillsConfiguration from '../../src/config/SkillsConfiguration';

describe('userSkillsService', () => {
  let mockServiceUrl;
  let mockProjectId;
  let mockUserSkillId;
  let MockXMLHttpRequest;
  let mockAuthenticationUrl;
  let mockAuthToken;
  let realXMLHttpRequest = window.XMLHttpRequest;

  beforeEach(() => {
    MockXMLHttpRequest = {
      open: jest.fn(),
      setRequestHeader: jest.fn(),
      send: jest.fn(),
    };

    window.XMLHttpRequest = jest.fn(() => MockXMLHttpRequest);
  });

  beforeEach(() => {
    mockServiceUrl = 'https://pathToNowhere';
    mockAuthenticationUrl = 'http://authenticateToNowhere';
    mockProjectId = `${Math.random()}`;
    mockUserSkillId = 'mockSkillId';
    mockAuthToken = 'abcd';
    SkillsConfiguration.configure({
      serviceUrl: mockServiceUrl,
      projectId: mockProjectId,
      authenticator: mockAuthenticationUrl
    });
    SkillsConfiguration.setAuthToken(mockAuthToken);
  });

  afterEach(() => {
    window.XMLHttpRequest = realXMLHttpRequest;
  });

  describe('constants', () => {
    it(`SUCCESS_EVENT is skills-report-success`, () => {
      expect(SUCCESS_EVENT).toBe('skills-report-success');
    });

    it(`FAILURE_EVENT is skills-report-error`, () => {
      expect(FAILURE_EVENT).toBe('skills-report-error');
    });
  });

  describe('reportSkill', () => {
    it('reportSkill calls the appropriate endpoint', () => {
      SkillsReporter.reportSkill(mockUserSkillId);
      expect(MockXMLHttpRequest.open).toHaveBeenCalledWith('POST', `${mockServiceUrl}/api/projects/${mockProjectId}/skills/${mockUserSkillId}`);
    });

    it('correctly sets the Authorization header', () => {
      SkillsReporter.reportSkill(mockUserSkillId);
      expect(MockXMLHttpRequest.setRequestHeader).toHaveBeenCalledWith('Authorization', `Bearer ${SkillsConfiguration.getAuthToken()}`);
    });

    it('enables withCredentials', () => {
      SkillsReporter.reportSkill(mockUserSkillId);
      expect(MockXMLHttpRequest.withCredentials).toBeTruthy();
    });

    it('sends out the ajax request', () => {
      SkillsReporter.reportSkill(mockUserSkillId);
      expect(MockXMLHttpRequest.send).toHaveBeenCalled();
    });

    describe('ajax responses', () => {
      beforeEach(() => {
        MockXMLHttpRequest.readyState = 4;
      });

      describe('successful ajax call', () => {
        let mockResponse;
        let promise;

        beforeEach(() => {
          MockXMLHttpRequest.status = 200;
          mockResponse = JSON.stringify({"success":true,"projectId":"movies","skillId":"IronMan","name":"Iron Man","pointsEarned":8,"skillApplied":true,"explanation":"Skill event was applied","completed":[]});
          MockXMLHttpRequest.response = mockResponse;
          promise = SkillsReporter.reportSkill(mockUserSkillId);
        });

        it('resolves upon successful http code', (done) => {
          MockXMLHttpRequest.onreadystatechange();
          promise.then((response) => {
            expect(JSON.stringify(response)).toEqual(mockResponse);
            done();
          });
        });

        // it('calls success handlers', (done) => {
        //   const handler1 = jest.fn();
        //   const handler2 = jest.fn();
        //
        //   SkillsReporter.addSuccessHandler(handler1);
        //   SkillsReporter.addSuccessHandler(handler2);
        //
        //   promise = SkillsReporter.reportSkill(mockUserSkillId);
        //
        //   MockXMLHttpRequest.onreadystatechange();
        //
        //   promise.finally(() => {
        //     expect(handler1).toHaveBeenCalledWith(JSON.parse(mockResponse));
        //     expect(handler2).toHaveBeenCalledWith(JSON.parse(mockResponse));
        //     done();
        //   });
        // });
      });

      describe('error ajax response', () => {
        let mockError;
        let promise;

        beforeEach(() => {
          MockXMLHttpRequest.status = 404;
          promise = SkillsReporter.reportSkill(mockUserSkillId);
          mockError = JSON.stringify({"explanation":"Failed to report skill event because skill definition does not exist.","errorCode":"SkillNotFound","success":false,"projectId":"movies","skillId":"DoesNotExist","userId":"user1"});
          MockXMLHttpRequest.response = mockError;
        });

        it('rejects the promise on error', (done) => {
          MockXMLHttpRequest.onreadystatechange();

          promise.catch((error) => {
            expect(JSON.stringify(error)).toEqual(mockError);
            done();
          });
        });

        it('calls error handlers', (done) => {
          const handler1 = jest.fn();
          const handler2 = jest.fn();
          const consoleSpy = jest.spyOn(console, 'error');

          SkillsReporter.addErrorHandler(handler1);
          SkillsReporter.addErrorHandler(handler2);

          MockXMLHttpRequest.onreadystatechange();

          promise.finally(() => {
            expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));
            expect(handler2).toHaveBeenCalledWith(JSON.parse(mockError));
            expect(consoleSpy).toHaveBeenCalledWith('Error reporting skill:', JSON.parse(mockError));
            done();
          });
        });
      });
    });
  });
});
