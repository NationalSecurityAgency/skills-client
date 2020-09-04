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
import Postmate from 'postmate';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import SkillsDisplayJS from '../../src/display/SkillsDisplayJS.js';
import ErrorPageUtils from '../../src/display/ErrorPageUtils.js';

jest.mock('../../src/display/ErrorPageUtils.js');
jest.mock('postmate');

describe('SkillsDisplayJS', () => {
  let mockHttp;

  beforeEach(() => {
    mockHttp = new MockAdapter(axios);
    Postmate.mockClear();
    ErrorPageUtils.removeAllChildren.mockClear();
    ErrorPageUtils.buildErrorPage.mockClear();
    mockHttp.onGet(/\/public\/status/).reply(200);
  });

  afterEach(() => mockHttp.reset());

  it('is found', () => {
    expect(SkillsDisplayJS).toBeDefined();
  });

  it('destroys the childFrame', () => {
    const mockChildFrame = {
      destroy: jest.fn(),
    };
    const client = new SkillsDisplayJS({
      options: null
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
      options: null
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
      mockHttp.reset();
      const mockServiceUrl = 'http://serviceUrlToNowhere';
      const client = new SkillsDisplayJS({
        options: {
          serviceUrl: mockServiceUrl,
        }
      });

      Postmate.mockImplementation(() => {
        return {
          then: jest.fn(),
        }
      });
      mockHttp.onGet(`${mockServiceUrl}/public/status`).networkError();

      const mockIframeContainer = {
        setAttribute: jest.fn(),
        appendChild: jest.fn(),
        style: {},
      };

      const mockErrorPage = `I am an error page ${Math.random()}`;
      ErrorPageUtils.buildErrorPage.mockImplementation(() => {
        return mockErrorPage;
      });

      global.document.querySelector = () => {
        return mockIframeContainer;
      };

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

      global.document.querySelector = jest.fn(() => {
        return null;
      });

      const mockSelector = `#${Math.random()}`
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

          on(eventName, handler) {
            this.eventHandlers[eventName] = handler;
          },

          emit(eventName, args) {
            this.eventHandlers[eventName].bind(skillsDisplay, args)();
          }
        };
        Postmate.mockImplementation(() => {
          return Promise.resolve(mockChildFrame);
        });
      });

      it('adjusts the iframe containers height on height-changed event', (done) => {
        const client = new SkillsDisplayJS({ options: null });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: {},
        };

        global.document.querySelector = () => {
          return mockIframeContainer;
        };

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

      describe('rout-changed event', () => {
        it('does not attempt to scroll if disableAutoScroll option is set', (done) => {
          const client = new SkillsDisplayJS({
            options: {
              disableAutoScroll: true,
            }
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
            scrollIntoView: jest.fn(),
          };

          global.document.querySelector = () => {
            return mockIframeContainer;
          };

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('route-changed');
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

          global.document.querySelector = () => {
            return mockIframeContainer;
          };

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('route-changed');
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
            mockChildFrame.emit('route-changed');
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
            } else {
              return mockIframeContainer;
            }
          };

          client.attachTo(mockIframeContainer);

          setTimeout(() => {
            mockChildFrame.emit('route-changed');
            expect(mockBody.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
            done();
          });
        });
      });

      describe('needs-authentication event', () => {
        it('tells the child it is in pki mode', (done) => {
          const client = new SkillsDisplayJS({
            options: {
              authenticator: 'pki',
            }
          });

          const mockIframeContainer = {
            setAttribute: jest.fn(),
            style: {},
          };

          global.document.querySelector = () => {
            return mockIframeContainer;
          };

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

          global.document.querySelector = () => {
            return mockIframeContainer;
          };

          client.attachTo(mockIframeContainer);

          const mockAccessToken = Math.random();
          mockHttp.onGet(mockAuthenticator).reply(200, {
            access_token: mockAccessToken
          });

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
              })
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

      beforeEach(() => {
        mockServiceUrl = `${Math.random()}`;
        mockAuthenticator = `${Math.random()}`;
        mockProjectId = `${Math.random()}`;
        mockTheme = { };
        mockVersion =`${Math.random()}`;

        Postmate.mockImplementation(() => {
          return {
            then: jest.fn(),
          };
        });
      });

      it('properly configures Postmate isSummaryOnly === false and pki mode', () => {
        const mockUserId = `${Math.random()}`;

        const client = new SkillsDisplayJS({
          options: {
            isSummaryOnly: false,
            authenticator: 'pki',
            serviceUrl: mockServiceUrl,
            projectId: mockProjectId,
          },
          userId: mockUserId,
          theme: mockTheme,
          version: mockVersion,
        });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: {},
        };

        global.document.querySelector = () => {
          return mockIframeContainer;
        };

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
            minHeight: '960px',
            isSummaryOnly: false,
          },
        });
      });

      it('properly configures Postmate isSummaryOnly === true and !pki mode', () => {
        const client = new SkillsDisplayJS({
          options: {
            isSummaryOnly: true,
            authenticator: mockAuthenticator,
            serviceUrl: mockServiceUrl,
            projectId: mockProjectId,
          },
          theme: mockTheme,
          version: mockVersion,
        });
        const mockIframeContainer = {
          setAttribute: jest.fn(),
          style: { },
        };

        global.document.querySelector = () => { return mockIframeContainer; };

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
            minHeight: '600px',
            isSummaryOnly: true,
          },
        });
      });
    });
  });

  describe('construction', () => {
    describe('options', () => {
      it('accepts options in the constructor', () => {
        const mockOptions = {authenticator: 'option'};
        const client = new SkillsDisplayJS({
          options: mockOptions
        });
        expect(client.options).toEqual(mockOptions);
      });

      it('supports null or undefined being passed', () => {
        let client = new SkillsDisplayJS({options: null});
        expect(client.options).toEqual({});
        client = new SkillsDisplayJS({options: undefined});
        expect(client.options).toEqual({});
      });

      it('supports empty constructor', () => {
        let client = new SkillsDisplayJS();
        expect(client.options).toEqual({});
      });

      it('validates options', () => {
        const invalidOption = `${Math.random()}`;
        const options = {
          [invalidOption]: Math.random(),
          authenticator: 'this is a valid option',
        };
        expect(() => {
          new SkillsDisplayJS({options});
        }).toThrowError(`Invalid option passed to SkillsDisplayJS ["${invalidOption}"]`);
      });

      it('accepts valid options', () => {
        const options = {
          'authenticator': true,
          'serviceUrl': true,
          'projectId': true,
          'disableAutoScroll': true,
          'autoScrollStrategy': true,
        };
        new SkillsDisplayJS({options});
      });
    });

    describe('theme', () => {
      it('accepts sets the theme object', () => {
        const mockTheme = {mock: 'theme'};
        const client = new SkillsDisplayJS({theme: mockTheme});

        expect(client.theme).toBe(mockTheme);
      });
    });

    describe('version', () => {
      it('accepts a version', () => {
        const mockVersion = Math.random();
        const client = new SkillsDisplayJS({version: mockVersion});

        expect(client.version).toBe(mockVersion);
      });
    });

    describe('userId', () => {
      it('accepts a version', () => {
        const userId = `${Math.random()}`;
        const client = new SkillsDisplayJS({userId});

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
      const client = new SkillsDisplayJS( { options });

      const configuration = client.configuration;
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
    let client = new SkillsDisplayJS({ version: newVersion - 1 });
    client._childFrame = mockClientFrame;

    client.version = newVersion;

    expect(mockClientFrame.call).toHaveBeenCalledWith('updateVersion', newVersion)
  });
});
