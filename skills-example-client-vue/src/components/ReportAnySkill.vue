<template>
    <div>
        <code-example-layout :title="title" :sample-code="sampleCode" code-type="javascript">
            <div slot="code">
                <multiselect v-model="skill" :options="available" placeholder="Select a skill id" :taggable="true" @tag="addTag"/>

                <button
                  :disabled="!hasSelectedSkill"
                  :title="buttonTitle"
                  :class="!hasSelectedSkill ? 'disabled' : ''"
                  class="btn btn-outline-primary mt-2"
                  type="button"
                  @click="reportSkill">Report Skill</button>
            </div>
            <span slot="res">{{reportResult}}</span>
        </code-example-layout>
    </div>
</template>

<script>
    import axios from 'axios';
    import { SkillsReporter } from '@skills/skills-client-vue';
    import CodeExampleLayout from "./CodeExampleLayout";

    import "highlight.js/styles/github.css"
    const beautify = require('js-beautify').js;

    export default {
        name: "ReportAnySkill",
        components: {CodeExampleLayout},
        data() {
            return {
                title: 'Pure JS - Report Any Skill',
                reportResult: '',
                sampleCode: beautify('reportSkill() {\n' +
                    '                SkillsReporter.reportSkill(this.skill)\n' +
                    '                    .then((res) => {\n' +
                    '                        this.reportResult = res;\n' +
                    '                    });\n' +
                    '            },', { indent_size: 2, indent_level: 1, end_with_newline: false }),
                skill: '',
                available: [],
            };
        },
        computed: {
            hasSelectedSkill() {
                return this.skill && this.skill !== '';
            },

            buttonTitle() {
                return this.hasSelectedSkill ? '' : 'Select a Skill to report from the dropdown';
            },
        },
        mounted() {
            axios.get("/api/skills")
                .then((result) => {
                    this.available = result.data;
                });
        },
        methods: {
            reportSkill() {
                SkillsReporter.reportSkill(this.skill)
                    .then((res) => {
                        this.reportResult = res;
                    })
                    .catch((res) => {
                        this.reportResult = res;
                    });
            },
            addTag(newTag) {
                this.available.push(newTag);
                this.skill = newTag;
            }
        },
    }
</script>

<style scoped>

</style>
