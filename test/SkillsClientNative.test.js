import SkillsClientNative from '../src/SkillsClientNative.js';

describe('SkillsClientNative', () => {
  it('is found', () => {
    expect(SkillsClientNative).toBeDefined();
  });

  describe('construction', () => {
    describe('options', () => {
      it('accepts options in the constructor', () => {
        const mockOptions = {authenticator: 'option'};
        const client = new SkillsClientNative({
          options: mockOptions
        });
        expect(client.options).toEqual(mockOptions);
      });

      it('supports null or undefined being passed', () => {
        let client = new SkillsClientNative({options: null});
        expect(client.options).toEqual({});
        client = new SkillsClientNative({options: undefined});
        expect(client.options).toEqual({});
      });

      it('validates options', () => {
        const invalidOption = `${Math.random()}`;
        const options = {
          [invalidOption]: Math.random(),
          authenticator: 'this is a valid option',
        };
        expect(() => {
          new SkillsClientNative({options});
        }).toThrowError(`Invalid option passed to SkillsNativeClient ["${invalidOption}"]`);
      });

      it('accepts valid options', () => {
        const options = {
          'authenticator': true,
          'serviceUrl': true,
          'projectId': true,
          'disableAutoScroll': true,
          'autoScrollStrategy': true,
        };
        new SkillsClientNative({options});
      });
    });

    describe('theme', () => {
      it('accepts sets the theme object', () => {
        const mockTheme = {mock: 'theme'};
        const client = new SkillsClientNative({theme: mockTheme});

        expect(client.theme).toBe(mockTheme);
      });
    });

    describe('version', () => {
      it('accepts a version', () => {
        const mockVersion = Math.random();
        const client = new SkillsClientNative({version: mockVersion});

        expect(client.version).toBe(mockVersion);
      });
    });

    describe('userId', () => {
      it('accepts a version', () => {
        const userId = `${Math.random()}`;
        const client = new SkillsClientNative({userId});

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
      const client = new SkillsClientNative( { options });

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
    let client = new SkillsClientNative({ version: newVersion - 1 });
    client._childFrame = mockClientFrame;

    client.version = newVersion;

    expect(mockClientFrame.call).toHaveBeenCalledWith('updateVersion', newVersion)
  });
});
