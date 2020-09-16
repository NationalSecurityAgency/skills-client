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
  <span
    v-show="skillLevel !== null"
    ref="skillLevelRef"
    class="skills-level-text-display" />
</template>

<script>
  import { SkillsConfiguration, SkillsLevelJS, Logger } from '@skilltree/skills-client-js';

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
    mounted() {
      SkillsConfiguration.afterConfigure()
        .then(() => {
          Logger.info('SkillsLevel::afterConfigure');
          const skillLevelJS = new SkillsLevelJS(this.getProjectId());
          Logger.info(`SkillsLevel::created SkillsLevelJS...calling attachTo for ref [${this.$refs.skillLevelRef}]`);
          skillLevelJS.attachTo(this.$refs.skillLevelRef);
          Logger.info('SkillsLevel::attached to SkillsLevelJS');
          this.skillLevel = skillLevelJS.skillLevel;
        });
    },
    methods: {
      getProjectId() {
        let projectId = this.project;
        if (!projectId) {
          projectId = SkillsConfiguration.getProjectId();
        }
        return projectId;
      },
    },
  };
</script>
