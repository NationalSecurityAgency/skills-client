import SkillsConfiguration from '@skills/skills-client-configuration';

import createAuthRefreshInterceptor from 'axios-auth-refresh';
import axios from 'axios';

const refreshAuthorization = (failedRequest) => {
  SkillsConfiguration.setAuthToken(null);
  return axios.get(SkillsConfiguration.getAuthenticator())
    .then((result) => {
      const accessToken =  result.data.access_token;
      SkillsConfiguration.setAuthToken(accessToken);
      if (failedRequest) {
        failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;
      }
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return Promise.resolve();
    });
};

// Instantiate the interceptor (you can chain it as it returns the axios instance)
createAuthRefreshInterceptor(axios, refreshAuthorization);

export default {
  getSkillLevel(projectId) {
    let authenticationPromise = Promise.resolve();
    if (SkillsConfiguration.getAuthenticator() !== 'pki') {
      if (!SkillsConfiguration.getAuthToken() || !axios.defaults.headers.common.Authorization) {
        authenticationPromise = refreshAuthorization();
      }
    }

    return new Promise((resolve, reject) => {
      authenticationPromise.then(() => {
        axios.get(`${SkillsConfiguration.getServiceUrl()}/api/projects/${projectId}/level`, { withCredentials: true })
          .then((result) => {
            resolve(result.data);
          });
      });
    });
  }
}
