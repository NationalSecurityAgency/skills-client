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
    v-if="skillLevel !== null"
    class="skills-level-text-display">
    Level {{ skillLevel }}
  </span>
</template>

<script>
  import SkillsLevelService from '@/component/SkillsLevelService';

  // import SkillsConfiguration from '@skills/skills-client-configuration';
  import { SkillsConfiguration, SkillsReporter } from '@skills/skills-client-js';

  const emptyArrayIfNull = value => value ? value : [];

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
            SkillsLevelService.getSkillLevel(this.getProjectId())
              .then((result) => {
                this.skillLevel = result;
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

        this.skillLevel = completed.filter((message) => {
          return message.id === 'OVERALL';
        }).reduce((maxLevel, currentLevelUpdateObject) => {
          const levelUpdate = currentLevelUpdateObject.level;
          return maxLevel < levelUpdate ? levelUpdate : maxLevel;
        }, this.skillLevel);
      },
    },
  };
</script>
