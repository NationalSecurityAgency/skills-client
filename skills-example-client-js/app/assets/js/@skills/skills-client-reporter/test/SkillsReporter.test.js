import {
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT
} from '../src/SkillsReporter.js';

import SkillsConfiguration from '@skills/skills-client-configuration';

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
    mockUserSkillId = `${mockUserSkillId}`;
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

    describe('reauthentication', () => {
      beforeEach(() => {
        let reportSkillXhr = {
          open: jest.fn(),
          setRequestHeader: jest.fn(),
          send: jest.fn(),
        };

        let authenticationXhr = {
          open: jest.fn(),
          setRequestHeader: jest.fn(),
          send: jest.fn(),
        };

        const mockXhrs = [authenticationXhr, reportSkillXhr];

        window.XMLHttpRequest = jest.fn(() => mockXhrs.pop());
        reportSkillXhr.readyState = 4;
        authenticationXhr.readyState = 4;
      });

      it('attempts reauthentication if 401 access denied is returned', () => {

      });
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
          mockResponse = JSON.stringify({
            hello: 'world',
          });
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

        it('calls success handlers', (done) => {
          const handler1 = jest.fn();
          const handler2 = jest.fn();

          SkillsReporter.addSuccessHandler(handler1);
          SkillsReporter.addSuccessHandler(handler2);

          promise = SkillsReporter.reportSkill(mockUserSkillId);

          MockXMLHttpRequest.onreadystatechange();

          promise.finally(() => {
            expect(handler1).toHaveBeenCalledWith(JSON.parse(mockResponse));
            expect(handler2).toHaveBeenCalledWith(JSON.parse(mockResponse));
            done();
          });
        });
      });

      describe('error ajax response', () => {
        let mockError;
        let promise;

        beforeEach(() => {
          MockXMLHttpRequest.status = 404;
          promise = SkillsReporter.reportSkill(mockUserSkillId);
          mockError = JSON.stringify({
            you: 'errored',
          });
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

          SkillsReporter.addErrorHandler(handler1);
          SkillsReporter.addErrorHandler(handler2);

          MockXMLHttpRequest.onreadystatechange();

          promise.finally(() => {
            expect(handler1).toHaveBeenCalledWith(JSON.parse(mockError));
            expect(handler2).toHaveBeenCalledWith(JSON.parse(mockError));
            done();
          });
        });
      });
    });
  });
});
