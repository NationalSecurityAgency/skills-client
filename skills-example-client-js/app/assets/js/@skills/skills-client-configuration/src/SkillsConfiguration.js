let waitForInitializePromise = null;
let initializedResolvers = null;

const initializeAfterConfigurePromise = () => {
  if (!waitForInitializePromise) {
    waitForInitializePromise = new Promise((resolve, reject) => {
      initializedResolvers = {
        resolve,
        reject,
      };
    });
  }
};

const setInitialized = () => {
  initializeAfterConfigurePromise();
  initializedResolvers.resolve();
};

initializeAfterConfigurePromise();

const exportObject = {
  configure({ serviceUrl, projectId, authenticator }) {
    this.projectId = projectId;
    this.serviceUrl = serviceUrl;
    this.authenticator = authenticator;
    setInitialized();
  },

  afterConfigure() {
    return waitForInitializePromise;
  },

  validate() {
    let errorMessage = null;
    if (!this.serviceUrl || !this.projectId || !this.authenticator) {
      errorMessage = 'You must configure a serviceUrl, projectId and authenticationUrl for SkillsReportService to use for the service';
      errorMessage += '';
      errorMessage += 'import SkillsConfiguration from \'@skills/skills-client-configuration\';';
      errorMessage += 'SkillsConfiguration.configure(serviceUrl, myProjectId, authenticationUrl);';
      errorMessage += '';
      errorMessage += 'SkillsConfiguration is a singleton and you only have to do this once.';
    }
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  },

  isPKIMode() {
    return this.getAuthenticator() === 'pki';
  },

  getProjectId() {
    return this.projectId;
  },

  getServiceUrl() {
    return this.serviceUrl;
  },

  getAuthenticator() {
    return this.authenticator;
  },

  getAuthToken() {
    return this.authToken;
  },

  setAuthToken(authToken) {
    this.authToken = authToken;
  },

  logout() {
    initializedResolvers = null;
    waitForInitializePromise = null;
    this.setAuthToken(null);
  },
};

window.SkillsConfiguration = exportObject; // Plain javascript support

export default exportObject;
