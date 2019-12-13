<template>
  <div ref="clientDisplayContainer" />
</template>

<script>
  import { SkillsDisplayJS } from '@skills/skills-client-js';

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
            'isSummaryOnly',
            'scrollTopOffset',
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
    watch: {
      version(newValue) {
        this.clientDisplay.version = newValue;
      },
    },
    mounted() {
      this.clientDisplay = new SkillsDisplayJS({
        options: this.options,
        version: this.version,
        theme: this.theme,
        userId: this.userId,
      });
      this.clientDisplay.attachTo(this.$refs.clientDisplayContainer);
    },
    beforeDestroy() {
      this.clientDisplay.destroy();
    },
  };
</script>

