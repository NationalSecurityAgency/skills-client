<template>
    <div class="container">
        <h2>Report Skills Examples</h2>
        <div class="text-primary">Global Event Result:</div>
        <div id="globalEventResult" class="border rounded p-3 bg-light">
            <pre>{{ globalEventResult }}</pre>
        </div>
        <code-example
                v-for="example in examples"
                v-bind:key="example.title"
                class="mt-5"
                :title="example.title"
                :sample-code="example.code"
        />

        <report-any-skill class="mt-5"/>

        <div class="mt-5"></div>

    </div>
</template>

<script>
  import CodeExample from "./CodeExample";
  import ReportAnySkill from "./ReportAnySkill";
  import {SkillsReporter} from "@skills/skills-client-vue";

  export default {
    name: "ReportSkills",
    components: {ReportAnySkill, CodeExample},
    data() {
      return {
        examples: [
          {
            title: 'Skills Directive - Click Event',
            code: '<button \n v-skills="\'IronMan\'" \n @skills-report-success="onReporterResponse">\n  Report Skill\n</button>',
          },
          {
            title: 'Skills Directive - Input Event',
            code: '<input \n type="text" \n v-skills:input="\'Thor\'" \n @skills-report-success="onReporterResponse"/>',
          },
          {
            title: 'Skills Directive - Error with Button',
            code: '<button \n v-skills="\'DoesNotExist\'" \n @skills-report-success="onReporterResponse" \n @skills-report-error="onReporterError">\n  Report Skill\n</button>',
          },
          {
            title: 'Skills Directive - Error with Input',
            code: '<input \n type="text" \n v-skills:input="\'DoesNotExist\'" \n @skills-report-success="onReporterResponse" \n @skills-report-error="onReporterError"/>',
          },
        ],
        globalEventResult: ''
      };
    },
    created() {
      SkillsReporter.addSuccessHandler(this.update);
    },
    methods: {
      update(result) {
        this.globalEventResult = result;
      }
    },
  }
</script>

<style scoped></style>
