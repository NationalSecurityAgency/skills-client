import SkillsConfiguration from '@skills/skills-client-configuration';

const SUCCESS_EVENT = 'skills-report-success';
const FAILURE_EVENT = 'skills-report-error';

const successHandlerCache = new Set();
const errorHandlerCache = new Set();

const callSuccessHandlers = (event) => {
  successHandlerCache.forEach((it) => it(event));
};

const callErrorHandlers = (event) => {
  errorHandlerCache.forEach((it) => it(event));
};

const getAuthenticationToken = function getAuthenticationToken() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', SkillsConfiguration.getAuthenticator());

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status !== 200) {
          reject(new Error('Unable to authenticate'));
        } else {
          const response = JSON.parse(xhr.response);
          if (!response.access_token) {
            reject(new Error('Unable to authenticate'));
          } else {
            resolve(response.access_token);
          }
        }
      }
    };

    xhr.send();
  });
};

const authenticateAndRetry = function authenticateAndRetry(userSkillId, resolve, reject) {
  getAuthenticationToken()
    .then((token) => {
      SkillsConfiguration.setAuthToken(token);
      this.reportSkill(userSkillId)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    })
    .catch((error) => {
      reject(error);
    });
};

const SkillsReporter = {
  addSuccessHandler(handler) {
    successHandlerCache.add(handler);
  },
  addErrorHandler(handler) {
    errorHandlerCache.add(handler);
  },
  reportSkill(userSkillId) {
    SkillsConfiguration.validate();

    const promise = new Promise((resolve, reject) => {
      if (!SkillsConfiguration.getAuthToken() && !SkillsConfiguration.isPKIMode()) {
        authenticateAndRetry.call(this, userSkillId, resolve, reject);
      } else {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${SkillsConfiguration.getServiceUrl()}/api/projects/${SkillsConfiguration.getProjectId()}/skills/${userSkillId}`);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Authorization', `Bearer ${SkillsConfiguration.getAuthToken()}`);

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status !== 200 && xhr.status !== 0 && xhr.status !== 401) {
              reject(JSON.parse(xhr.response));
            } else if (xhr.status === 401 || xhr.status === 0) {
              authenticateAndRetry.call(this, userSkillId, resolve, reject);
            } else {
              resolve(JSON.parse(xhr.response));
            }
          }
        };

        xhr.send();
      }
    });

    promise.then((result) => {
      callSuccessHandlers(result);
    });

    promise.catch((error) => {
      callErrorHandlers(error);
    });

    return promise;
  },
};

export {
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT,
};
