/*
Copyright 2020 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
<template>
  <div ref="clientDisplayContainer" />
</template>

<script>
  import { SkillsDisplayJS } from '@skilltree/skills-client-js';

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
          const isValidConfigOption = passedOptions.every((passedOption) => configOptions.includes(passedOption));
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
        type: [String, Object],
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
