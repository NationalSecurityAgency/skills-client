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
import { SkillsConfiguration } from '@skills/skills-client-js';

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
      if (!SkillsConfiguration.getAuthToken() ||!axios.defaults.headers.common.Authorization) {
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
