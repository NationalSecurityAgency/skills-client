<template>
  <div ref="iframeContainer" />
</template>

<script>
  import Vue from 'vue';
  import VueScrollTo from 'vue-scrollto';
  import Postmate from 'postmate';
  import axios from 'axios';

  import SkillsConfiguration from '@skills/skills-client-configuration';

  Vue.use(VueScrollTo);

  export default {
    props: {
      options: {
        type: Object,
        required: false,
        default: () => ({}),
        validator(value) {
          const defaults = {
            disableAutoScroll: false,
          };
          const configOptions = [
            'authenticator',
            'serviceUrl',
            'projectId',
            'disableAutoScroll',
            'autoScrollStrategy',
          ];
          const options = { ...defaults, ...value };
          const passedOptions = Object.keys(options);
          const isValidConfigOption = passedOptions.every(passedOption => configOptions.includes(passedOption));
          return isValidConfigOption;
        },
      },
      theme: {
        type: Object,
        required: false,
        default: null,
      },
      version: {
        type: Number,
        default: 0,
      },
      userId: {
        type: String,
        required: false,
        default: null,
      },
    },
    data() {
      return {
        authenticationPromise: null, // Vuex would be more appropriate
      };
    },
    computed: {
      configuration() {
        const serviceUrl = this.options.serviceUrl ? this.options.serviceUrl : SkillsConfiguration.getServiceUrl();
        const authenticator = this.options.authenticator ? this.options.authenticator : SkillsConfiguration.getAuthenticator();
        const projectId = this.options.projectId ? this.options.projectId : SkillsConfiguration.getProjectId();
        return { serviceUrl, authenticator, projectId };
      }
    },
    watch: {
      version(newValue) {
        this.childFrame.call('updateVersion', newValue);
      },
    },
    mounted() {
      const configuration = this.configuration;
      const handshake = new Postmate({
        container: this.$refs.iframeContainer,
        url: `${configuration.serviceUrl}/static/clientPortal/index.html`,
        classListArray: ['client-display-iframe'],
        model: {
          serviceUrl: configuration.serviceUrl,
          projectId: configuration.projectId,
          version: this.version,
          userId: configuration.authenticator === 'pki' ? this.userId: null,
          theme: this.theme,
          minHeight: '960px',
        },
      });

      this.$refs.iframeContainer.height = 0;
      this.$refs.iframeContainer.style.height = '0px';
      // Make height changes smoother behind the scenes when the iframe is building.
      // this.$refs.iframeContainer.style.backgroundColor = this.theme.backgroundColor ? this.theme.backgroundColor : 'white';

      handshake.then((child) => {
        this.childFrame = child;
        child.on('height-changed', (data) => {
          const adjustedHeight = Math.max(data, 960);
          this.$refs.iframeContainer.height = adjustedHeight;
          this.$refs.iframeContainer.style.height = `${adjustedHeight}px`;
        });
        child.on('route-changed', () => {
          if (!this.options.disableAutoScroll) {
            let scrollToElement = this.$refs.iframeContainer;
            if (this.options.autoScrollStrategy === 'top-of-page') {
              scrollToElement = document.body;
            }
            VueScrollTo.scrollTo(scrollToElement, 1000, {
              y: true,
              x: false,
            });
          }
        });
        child.on('needs-authentication', () => {
          if (!this.authenticationPromise && this.configuration.authenticator !== 'pki') {
            this.authenticationPromise = axios.get(this.configuration.authenticator)
              .then((result) => {
                child.call('updateAuthenticationToken', result.data.access_token);
              })
              .finally(() => {
                this.authenticationPromise = null;
              });
          } else if (this.configuration.authenticator === 'pki') {
            child.call('updateAuthenticationToken', 'pki');
          }
        });
      });
    },
    beforeDestroy() {
      this.childFrame.destroy();
    },
  };
</script>

<style>
  .client-display-iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
