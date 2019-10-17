(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SkillsConfiguration = f()}})(function(){var define,module,exports;module={exports:(exports={})};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var waitForInitializePromise = null;
var initializedResolvers = null;

var initializeAfterConfigurePromise = function initializeAfterConfigurePromise() {
  if (!waitForInitializePromise) {
    waitForInitializePromise = new Promise(function (resolve, reject) {
      initializedResolvers = {
        resolve: resolve,
        reject: reject
      };
    });
  }
};

var setInitialized = function setInitialized() {
  initializeAfterConfigurePromise();
  initializedResolvers.resolve();
};

initializeAfterConfigurePromise();
var exportObject = {
  configure: function configure(_ref) {
    var serviceUrl = _ref.serviceUrl,
        projectId = _ref.projectId,
        authenticator = _ref.authenticator;
    this.projectId = projectId;
    this.serviceUrl = serviceUrl;
    this.authenticator = authenticator;
    setInitialized();
  },
  afterConfigure: function afterConfigure() {
    return waitForInitializePromise;
  },
  validate: function validate() {
    var errorMessage = null;

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
  isPKIMode: function isPKIMode() {
    return this.getAuthenticator() === 'pki';
  },
  getProjectId: function getProjectId() {
    return this.projectId;
  },
  getServiceUrl: function getServiceUrl() {
    return this.serviceUrl;
  },
  getAuthenticator: function getAuthenticator() {
    return this.authenticator;
  },
  getAuthToken: function getAuthToken() {
    return this.authToken;
  },
  setAuthToken: function setAuthToken(authToken) {
    this.authToken = authToken;
  },
  logout: function logout() {
    initializedResolvers = null;
    waitForInitializePromise = null;
    this.setAuthToken(null);
  }
};
window.SkillsConfiguration = exportObject; // Plain javascript support

var _default = exportObject;
exports.default = _default;
return module.exports;});

