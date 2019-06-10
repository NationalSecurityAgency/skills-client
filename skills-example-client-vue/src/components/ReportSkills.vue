<template>
    <div class="container">
        <h2>Report Skills Examples</h2>
        <code-example v-for="example in examples" v-bind:key="example.title" class="mt-5"
                      :title="example.title" :sample-code="example.code"/>


        <report-any-skill class="mt-5"/>

        <div class="mt-5"></div>

    </div>
</template>

<script>
    import CodeExample from "./CodeExample";
    import ReportAnySkill from "./ReportAnySkill";
    export default {
        name: "ReportSkills",
        components: {ReportAnySkill, CodeExample},
        data() {
            return {
                examples: [
                    {
                        title:'Skills Directive - Click Event',
                        code: '<button type="button" v-skills="\'IronMan\'" @skills-report-response="onReporterResponse">Report Skill</button>',
                    },
                    {
                        title:'Skills Directive - Input Event',
                        code: '<input type="text" v-skills:input="\'Thor\'" @skills-report-response="onReporterResponse"/>',
                    },
                    {
                        title:'Skills Directive - Error with Button',
                        code: '<button type="button" v-skills="\'DoesNotExist\'" @skills-report-response="onReporterResponse">Report Skill</button>',
                    },
                    {
                        title:'Skills Directive - Error with Input',
                        code: '<input type="text" v-skills:input="\'DoesNotExist\'" @skills-report-response="onReporterResponse"/>',
                    },
                ],
            };
        },
    }
</script>

<style scoped>

</style>
