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
import Postmate from 'postmate';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import SkillsDisplayJS from '../../src/display/SkillsDisplayJS';
import ErrorPageUtils from '../../src/display/ErrorPageUtils';

jest.mock('../../src/display/ErrorPageUtils.js');
jest.mock('postmate');

describe('SkillsDisplayJS', () => {
  let mockHttp;

  beforeEach(() => {
    mockHttp = new MockAdapter(axios);
    Postmate.mockClear();
    ErrorPageUtils.removeAllChildren.mockClear();
    ErrorPageUtils.buildErrorPage.mockClear();
    // mockHttp.onGet(/\/public\/status/).reply(200);
    mock.setup();
    mock.get(/.*\/public\/status/, (req, res) => res.status(200).body('{"status":"OK","clientLib":{"loggingEnabled":"false","loggingLevel":"DEBUG"}}'));
  });

  afterEach(() => {
    mock.teardown();
    mockHttp.reset();
  });

  it('is found', () => {
    expect(SkillsDisplayJS).toBeDefined();
  });

  it('destroys the childFrame', () => {
    const mockChildFrame = {
      destroy: jest.fn(),
    };
    const client = new SkillsDisplayJS({
      options: null,
    });

    client._childFrame = mockChildFrame;

    client.destroy();

    expect(client._childFrame.destroy).toHaveBeenCalled();
  });

  it('doesnt error if the childFrame is null on destroy', () => {
    const mockChildFrame = {
      destroy: jest.fn(),
    };
    const client = new SkillsDisplayJS({
      options: null,
    });

    client._childFrame = null;

    expect(() => {
      client.destroy();
    }).not.toThrow();
  });

  describe('attachTo', () => {
    let realDocument;

    beforeEach(() => {
      realDocument = global.document;
      global.document.querySelector = jest.fn();
    });

    afterEach(() => {
      global.document = realDocument;
    });

    it('checks the service status', (done) => {
      // mockHttp.reset();
      mock.reset();
      const mockServiceUrl = 'http://serviceUrlToNowhere';
      const client = new SkillsDisplayJS({
        options: {
          serviceUrl: mockServiceUrl,
        },
      });

      Postmate.mockImplementation(() => ({
        then: jest.fn(),
      }));
      // mock.get(`${mockServiceUrl}/public/status`, () => Promise.reject(new Error()));
      mock.get(`${mockServiceUrl}/public/status`, { status: 503 });

      const mockIframeContainer = {
        setAttribute: jest.fn(),
        appendChild: jest.fn(),
        style: {},
      };

      const mockErrorPage = `I am an error page ${Math.random()}`;
      ErrorPageUtils.buildErrorPage.mockImplementation(() => mockErrorPage);

      global.document.querySelector = () => mockIframeContainer;

      console.error = jest.fn();

      client.attachTo(mockIframeContainer);

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Please ensure the skilltree server is running. skilltree service URL: http://serviceUrlToNowhere');
        expect(ErrorPageUtils.removeAllChildren).toHaveBeenCalledWith(mockIframeContainer);
        expect(mockIframeContainer.appendChild).toHaveBeenCalledWith(mockErrorPage);
        expect(mockIframeContainer.setAttribute).toHaveBeenCalledWith('style', 'border: 5px; height: 20rem; width: 100%');
        done();
      });
    });

    it('throws an error if element to attach to does not exist', () => {
      const client = new SkillsDisplayJS({ options: null });

      global.document.querySelector = jest.fn(() => null);

      const mockSelector = `#${Math.random()}`;
      expect(() => {
        client.attachTo(mockSelector);
      }).toThrow(`Can't find element with selector='${mockSelector}'`);

      expect(() => {
        client.attachTo(null);
      }).toThrow(`Can't find element with selector='${null}'`);
    });

    describe('Postmate event handling', () => {
      let skillsDisplay;
      let mockChildFrame;

      beforeEach(() => {
        const skillsDisplay = new SkillsDisplayJS({ options: null });

        mockChildFrame = {
          eventHandlers: { },

          call: jest.fn(),

          frame: { className: 'client-display-iframe-1' },

          on(eventName, handler) {
            this.eventHandlers[eventName] = handler;
          },

          emit(eventName, args) {
            this.eventHandlers[eventName].bind(skillsDisplay, args)();
          },
        };
        Postmate.mockImplementation(() => Promise.resolve(mockChildFrame));
      });

      it('adjusts the iframe containers height on height-changed event', (done) => {
        const client = new SkillsDisplayJS({ options: null });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: {},
        };

        global.document.querySelector = () => mockIframeContainer;

        client.attachTo(mockIframeContainer);

        expect(mockIframeContainer.height).toBe(0);
        expect(mockIframeContainer.style.height).toBe('0px');

        // Let the promise resolve..
        const newHeight = 1000000000;
        setTimeout(() => {
          mockChildFrame.emit('height-changed', newHeight);
          expect(mockIframeContainer.height).toBe(newHeight);
          expect(mockIframeContainer.style.height).toBe(`${newHeight}px`);
          done();
        });
      });

      describe('do-scroll event', () => {
        it('do-scroll event is called', (done) => {
          const client = new SkillsDisplayJS({
            options: {},
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},

            getBoundingClientRect: jest.fn(() => ({ top: 200 })),
          };

          global.document.querySelector = () => mockIframeContainer;
          global.scroll = jest.fn();

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('do-scroll', 500);
            expect(global.scroll).toHaveBeenCalledWith({ top: 700, behavior: 'smooth' });
            done();
          });
        });

        it('do-scroll event is called with scrollTopOffset', (done) => {
          const client = new SkillsDisplayJS({
            options: {
              scrollTopOffset: 133,
            },
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},

            getBoundingClientRect: jest.fn(() => ({ top: 200 })),
          };

          global.document.querySelector = () => mockIframeContainer;
          global.scroll = jest.fn();

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('do-scroll', 500);
            expect(global.scroll).toHaveBeenCalledWith({ top: 567, behavior: 'smooth' });
            done();
          });
        });
      });

      describe('route-changed event', () => {
        it('does not attempt to scroll if disableAutoScroll option is set', (done) => {
          const client = new SkillsDisplayJS({
            options: {
              disableAutoScroll: true,
            },
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
            scrollIntoView: jest.fn(),
          };

          global.document.querySelector = () => mockIframeContainer;

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('route-changed', { path: 'blah', query: {} });
            expect(mockIframeContainer.scrollIntoView).not.toHaveBeenCalled();
            done();
          });
        });

        it('does auto scrolls to the top of the iframe if autoScrollStrategy is not top-of-page', (done) => {
          const client = new SkillsDisplayJS({ options: null });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
            scrollIntoView: jest.fn(),
          };

          global.document.querySelector = () => mockIframeContainer;

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('route-changed', { path: 'blah', query: {} });
            expect(mockIframeContainer.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
            done();
          });
        });

        it('does auto scroll to configured offset', (done) => {
          const client = new SkillsDisplayJS({ options: { scrollTopOffset: 10, autoScrollStrategy: 'top-offset' } });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
            scrollIntoView: jest.fn(),
          };

          global.document.querySelector = () => mockIframeContainer;

          global.scroll = jest.fn();

          client.attachTo(mockIframeContainer);
          const top = mockIframeContainer.offsetTop - 10;

          setTimeout(() => {
            mockChildFrame.emit('route-changed', { path: 'blah', query: {} });
            expect(global.scroll).toHaveBeenCalledWith({ top, behavior: 'smooth' });
            done();
          });
        });

        it('if autoScrollStrategy is top-of-page it will scroll to the top of the html document', (done) => {
          const client = new SkillsDisplayJS({ options: { autoScrollStrategy: 'top-of-page' } });

          const mockBody = {
            scrollIntoView: jest.fn(),
          };

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
            scrollIntoView: jest.fn(),
          };

          global.document.querySelector = (selector) => {
            if (selector === 'body') {
              return mockBody;
            }
            return mockIframeContainer;
          };

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('route-changed', { path: 'blah', query: {} });
            expect(mockBody.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
            done();
          });
        });

        it('handles null params', (done) => {
          const client = new SkillsDisplayJS({
            options: {
              disableAutoScroll: true,
            },
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
            scrollIntoView: jest.fn(),
          };

          global.document.querySelector = () => mockIframeContainer;

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('route-changed');
            expect(mockIframeContainer.scrollIntoView).not.toHaveBeenCalled();
            done();
          });
        });
      });

      describe('needs-authentication event', () => {
        it('tells the child it is in pki mode', (done) => {
          const client = new SkillsDisplayJS({
            options: {
              authenticator: 'pki',
            },
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
          };

          global.document.querySelector = () => mockIframeContainer;

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('needs-authentication');
            expect(mockChildFrame.call).toHaveBeenCalledWith('updateAuthenticationToken', 'pki');

            const client = new SkillsDisplayJS({
              options: null,
            });

            done();
          });
        });

        it('gets a new authToken and sends it to the child', (done) => {
          const mockAuthenticator = 'http://urlToNowhere.com';
          const client = new SkillsDisplayJS({
            options: {
              authenticator: mockAuthenticator,
            },
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
          };

          global.document.querySelector = () => mockIframeContainer;

          client.attachTo(mockIframeContainer);

          const mockAccessToken = `${Math.random()}`;
          mockHttp.onGet(mockAuthenticator).reply(200, {
            access_token: mockAccessToken,
          });

          mock.get('http://urltonowhere.com/', (req, res) => res.status(200).body(`{"access_token":"${mockAccessToken}"}`));

          setTimeout(() => {
            expect(client.authenticationPromise).not.toBeDefined();
            mockChildFrame.emit('needs-authentication');
            expect(client.authenticationPromise).toBeDefined();
            setTimeout(() => {
              expect(mockChildFrame.call).toHaveBeenCalledWith('updateAuthenticationToken', mockAccessToken);
              setTimeout(() => {
                // finally block
                expect(client.authenticationPromise).toBe(null);
                done();
              });
            });
          });
        });
      });
    });

    describe('newing up Postmate', () => {
      let mockServiceUrl;
      let mockAuthenticator;
      let mockProjectId;
      let mockTheme;
      let mockVersion;
      let mockOptions;

      beforeEach(() => {
        mockServiceUrl = `${Math.random()}`;
        mockAuthenticator = `${Math.random()}`;
        mockProjectId = `${Math.random()}`;
        mockTheme = { };
        mockOptions = {
          authenticator: mockAuthenticator,
          isSummaryOnly: false,
          projectId: mockProjectId,
          serviceUrl: mockServiceUrl,
        };
        mockVersion = `${Math.random()}`;

        Postmate.mockImplementation(() => ({
          then: jest.fn(),
        }));
      });

      it('properly configures Postmate isSummaryOnly === false and pki mode', () => {
        const mockUserId = `${Math.random()}`;
        const options = {
          isSummaryOnly: false,
          authenticator: 'pki',
          serviceUrl: mockServiceUrl,
          projectId: mockProjectId,
        };

        const client = new SkillsDisplayJS({
          options,
          userId: mockUserId,
          theme: mockTheme,
          version: mockVersion,
        });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: {},
        };

        global.document.querySelector = () => mockIframeContainer;

        client.attachTo(mockIframeContainer);

        expect(Postmate).toHaveBeenCalledWith({
          container: mockIframeContainer,
          url: `${mockServiceUrl}/static/clientPortal/index.html`,
          classListArray: [`client-display-iframe-${client.currentIframeId()}`],
          model: {
            serviceUrl: mockServiceUrl,
            projectId: mockProjectId,
            version: mockVersion,
            userId: mockUserId,
            theme: mockTheme,
            options,
            minHeight: '960px',
            isSummaryOnly: false,
            internalBackButton: false,
          },
        });
      });

      it('properly configures Postmate isSummaryOnly === true and !pki mode', () => {
        const options = {
          isSummaryOnly: true,
          authenticator: mockAuthenticator,
          serviceUrl: mockServiceUrl,
          projectId: mockProjectId,
        };
        const client = new SkillsDisplayJS({
          options,
          theme: mockTheme,
          version: mockVersion,
        });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: { },
        };

        global.document.querySelector = () => mockIframeContainer;

        client.attachTo(mockIframeContainer);

        expect(Postmate).toHaveBeenCalledWith({
          container: mockIframeContainer,
          url: `${mockServiceUrl}/static/clientPortal/index.html`,
          classListArray: [`client-display-iframe-${client.currentIframeId()}`],
          model: {
            serviceUrl: mockServiceUrl,
            projectId: mockProjectId,
            version: mockVersion,
            userId: null,
            theme: mockTheme,
            options,
            minHeight: '600px',
            isSummaryOnly: true,
            internalBackButton: false,
          },
        });
      });

      it('properly configures Postmate internalBackButton === false when set explicitly', () => {
        const options = {
          isSummaryOnly: true,
          authenticator: mockAuthenticator,
          serviceUrl: mockServiceUrl,
          projectId: mockProjectId,
          internalBackButton: false,
        };
        const client = new SkillsDisplayJS({
          options,
          theme: mockTheme,
          version: mockVersion,
        });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: { },
        };

        global.document.querySelector = () => mockIframeContainer;

        client.attachTo(mockIframeContainer);

        expect(Postmate).toHaveBeenCalledWith({
          container: mockIframeContainer,
          url: `${mockServiceUrl}/static/clientPortal/index.html`,
          classListArray: [`client-display-iframe-${client.currentIframeId()}`],
          model: {
            serviceUrl: mockServiceUrl,
            projectId: mockProjectId,
            version: mockVersion,
            userId: null,
            theme: mockTheme,
            options,
            minHeight: '600px',
            isSummaryOnly: true,
            internalBackButton: false,
          },
        });
      });

      it('properly configures Postmate internalBackButton === true when set explicitly', () => {
        const options = {
          isSummaryOnly: true,
          authenticator: mockAuthenticator,
          serviceUrl: mockServiceUrl,
          projectId: mockProjectId,
          internalBackButton: true,
        };
        const client = new SkillsDisplayJS({
          options,
          theme: mockTheme,
          version: mockVersion,
        });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: { },
        };

        global.document.querySelector = () => mockIframeContainer;

        client.attachTo(mockIframeContainer);

        expect(Postmate).toHaveBeenCalledWith({
          container: mockIframeContainer,
          url: `${mockServiceUrl}/static/clientPortal/index.html`,
          classListArray: [`client-display-iframe-${client.currentIframeId()}`],
          model: {
            serviceUrl: mockServiceUrl,
            projectId: mockProjectId,
            version: mockVersion,
            userId: null,
            theme: mockTheme,
            options,
            minHeight: '600px',
            isSummaryOnly: true,
            internalBackButton: true,
          },
        });
      });

      it('properly configures Postmate internalBackButton === false when NOT set explicitly', () => {
        const options = {
          isSummaryOnly: true,
          authenticator: mockAuthenticator,
          serviceUrl: mockServiceUrl,
          projectId: mockProjectId,
        };
        const client = new SkillsDisplayJS({
          options,
          theme: mockTheme,
          version: mockVersion,
        });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: { },
        };

        global.document.querySelector = () => mockIframeContainer;

        client.attachTo(mockIframeContainer);

        expect(Postmate).toHaveBeenCalledWith({
          container: mockIframeContainer,
          url: `${mockServiceUrl}/static/clientPortal/index.html`,
          classListArray: [`client-display-iframe-${client.currentIframeId()}`],
          model: {
            options,
            serviceUrl: mockServiceUrl,
            projectId: mockProjectId,
            version: mockVersion,
            userId: null,
            theme: mockTheme,
            minHeight: '600px',
            isSummaryOnly: true,
            internalBackButton: false,
          },
        });
      });
    });
  });

  describe('construction', () => {
    describe('options', () => {
      it('accepts options in the constructor', () => {
        const mockOptions = { authenticator: 'option' };
        const client = new SkillsDisplayJS({
          options: mockOptions,
        });
        expect(client.options).toEqual(mockOptions);
      });

      it('supports null or undefined being passed', () => {
        let client = new SkillsDisplayJS({ options: null });
        expect(client.options).toEqual({});
        client = new SkillsDisplayJS({ options: undefined });
        expect(client.options).toEqual({});
      });

      it('supports empty constructor', () => {
        const client = new SkillsDisplayJS();
        expect(client.options).toEqual({});
      });

      it('accepts valid options', () => {
        const options = {
          authenticator: true,
          serviceUrl: true,
          projectId: true,
          disableAutoScroll: true,
          autoScrollStrategy: true,
        };
        new SkillsDisplayJS({ options });
      });
    });

    describe('theme', () => {
      it('accepts sets the theme object', () => {
        const mockTheme = { mock: 'theme' };
        const client = new SkillsDisplayJS({ theme: mockTheme });

        expect(client.theme).toBe(mockTheme);
      });
    });

    describe('version', () => {
      it('accepts a version', () => {
        const mockVersion = Math.random();
        const client = new SkillsDisplayJS({ version: mockVersion });

        expect(client.version).toBe(mockVersion);
      });
    });

    describe('userId', () => {
      it('accepts a version', () => {
        const userId = `${Math.random()}`;
        const client = new SkillsDisplayJS({ userId });

        expect(client.userId).toBe(userId);
      });
    });
  });

  describe('get configuration()', () => {
    it('users options passed during construction if they exist', () => {
      const mockServiceUrl = `${Math.random()}`;
      const mockAuthenticator = `${Math.random()}`;
      const mockProjectId = `${Math.random()}`;
      const options = {
        serviceUrl: mockServiceUrl,
        authenticator: mockAuthenticator,
        projectId: mockProjectId,
      };
      const client = new SkillsDisplayJS({ options });

      const { configuration } = client;
      expect(configuration.serviceUrl).toBe(mockServiceUrl);
      expect(configuration.authenticator).toBe(mockAuthenticator);
      expect(configuration.projectId).toBe(mockProjectId);
    });
  });

  it('setting a new versions informs the childFrame', () => {
    const mockClientFrame = {
      call: jest.fn(),
    };
    const newVersion = 2;
    const client = new SkillsDisplayJS({ version: newVersion - 1 });
    client._childFrame = mockClientFrame;

    client.version = newVersion;

    expect(mockClientFrame.call).toHaveBeenCalledWith('updateVersion', newVersion);
  });
});
