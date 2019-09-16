<template>
  <span
    v-if="skillLevel !== null"
    class="skills-level-text-display">
    Level {{ skillLevel }}
  </span>
</template>

<script>
  import SkillsReporterDirective from '../directive/SkillsReporterDirective.js';
  import SkillsConfiguration from '@skills/skills-client-configuration';

  import axios from 'axios'

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
      SkillsReporterDirective.addSuccessHandler(this.update);
    },
    mounted() {
      this.getCurrentSkillLevel();
    },
    methods: {
      getCurrentSkillLevel() {
        const serviceUrl = SkillsConfiguration.getServiceUrl();
        axios.get(`${serviceUrl}/api/projects/${this.projectId}/level`)
          .then((result) => {
            this.skillLevel = result.data
          });
      },
      update(reportSkillResponse) {
        const completed = emptyArrayIfNull(reportSkillResponse.completed);

        const levelUpdate = completed.find((message) => {
          return message.type === '' && message.level;
        });

        if (levelUpdate) {
          this.skillLevel = levelUpdate.level;
        }
      },
    },
  };
</script>
