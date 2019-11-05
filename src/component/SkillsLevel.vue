<template>
  <span
    v-if="skillLevel !== null"
    class="skills-level-text-display">
    Level {{ skillLevel }}
  </span>
</template>

<script>
  import SkillsLevelService from '@/component/SkillsLevelService';

  import SkillsConfiguration from '@skills/skills-client-configuration';
  import { SkillsReporter } from '@skills/skills-client-reporter';

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
