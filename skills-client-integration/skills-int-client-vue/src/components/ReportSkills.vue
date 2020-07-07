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
    <div class="container">
        <h2>Report Skills Examples</h2>
        <div class="text-primary">Global Event Result:</div>
        <div id="globalEventResultDiv" class="border rounded p-3 bg-light">
            <pre data-cy="globalEventResult">{{ globalEventResult }}</pre>
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
  import {SkillsReporter} from "@skilltree/skills-client-vue";

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
