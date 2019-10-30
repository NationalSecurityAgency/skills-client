<template>
  <span
    v-if="skillLevel !== null"
    class="skills-level-text-display">
    Level {{ skillLevel }}
  </span>
</template>

<script>
  import createAuthRefreshInterceptor from 'axios-auth-refresh';

  import SkillsConfiguration from '@skills/skills-client-configuration';
  import { SkillsReporter } from '@skills/skills-client-reporter';

  import axios from 'axios'

  const emptyArrayIfNull = value => value ? value : [];

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
    props: {
      projectId: {
        type: String,
        required: false,
        default: null,
      },
    },
    data() {
      return {
        skillLevel: null,
      };
    },
    created() {
      SkillsReporter.addSuccessHandler(this.update);
    },
    mounted() {
      this.getCurrentSkillLevel();
    },
    methods: {
      getCurrentSkillLevel() {
        SkillsConfiguration.afterConfigure()
          .then(() => {
            const serviceUrl = SkillsConfiguration.getServiceUrl();
            const projectId = this.getProjectId();

            let authenticationPromise = Promise.resolve();
            if (SkillsConfiguration.getAuthenticator() !== 'pki') {
              if (!SkillsConfiguration.getAuthToken()) {
                authenticationPromise = refreshAuthorization();
              }
            }

            authenticationPromise.then(() => {
              axios.get(`${serviceUrl}/api/projects/${projectId}/level`, { withCredentials: true })
                .then((result) => {
                  this.skillLevel = result.data
                });
            });
        });
      },
      getProjectId() {
        let projectId = this.projectId;
        if (!projectId) {
          projectId = SkillsConfiguration.getProjectId();
        }
        return projectId;
      },
      update(details) {
        const completed = emptyArrayIfNull(details.completed);

        const levelUpdate = completed.find((message) => {
          return message.id === 'OVERALL' && message.level;
        });

        if (levelUpdate) {
          this.skillLevel = levelUpdate.level;
        }
      },
    },
  };
</script>
