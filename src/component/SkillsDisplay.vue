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
    watch: {
      version(newValue) {
        this.childFrame.call('updateVersion', newValue);
      },
    },
    mounted() {
      const handshake = new Postmate({
        container: this.$refs.iframeContainer,
        url: `${SkillsConfiguration.getServiceUrl()}/static/clientPortal/index.html`,
        classListArray: ['client-display-iframe'],
        model: {
          serviceUrl: SkillsConfiguration.getServiceUrl(),
          projectId: SkillsConfiguration.getProjectId(),
          version: this.version,
          userId: SkillsConfiguration.getAuthenticator() === 'pki' ? this.userId: null,
        },
      });

      handshake.then((child) => {
        this.childFrame = child;
        child.on('height-changed', (data) => {
          if (data > 0) {
            const adjustedHeight = Math.max(data, window.screen.height);
            this.$refs.iframeContainer.height = adjustedHeight;
            this.$refs.iframeContainer.style.height = `${adjustedHeight}px`;
          }
        });
        child.on('route-changed', () => {
          VueScrollTo.scrollTo(this.$refs.iframeContainer, 1000, {
            y: true,
            x: false,
          });
        });
        child.on('needs-authentication', () => {
          if (!this.authenticationPromise && SkillsConfiguration.getAuthenticator() !== 'pki') {
            this.authenticationPromise = axios.get(SkillsConfiguration.getAuthenticator())
              .then((result) => {
                child.call('updateAuthenticationToken', result.data.access_token);
              })
              .finally(() => {
                this.authenticationPromise = null;
              });
          } else if (SkillsConfiguration.getAuthenticator() === 'pki') {
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
