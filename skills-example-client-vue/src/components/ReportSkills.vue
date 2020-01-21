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
                        code: '<button \n v-skills="\'IronMan\'" \n @skills-report-success="onReporterResponse">\n  Report Skill\n</button>',
                    },
                    {
                        title:'Skills Directive - Input Event',
                        code: '<input \n type="text" \n v-skills:input="\'Thor\'" \n @skills-report-success="onReporterResponse"/>',
                    },
                    {
                        title:'Skills Directive - Error with Button',
                        code: '<button \n v-skills="\'DoesNotExist\'" \n @skills-report-success="onReporterResponse" \n @skills-report-error="onReporterError">\n  Report Skill\n</button>',
                    },
                    {
                        title:'Skills Directive - Error with Input',
                        code: '<input \n type="text" \n v-skills:input="\'DoesNotExist\'" \n @skills-report-success="onReporterResponse" \n @skills-report-error="onReporterError"/>',
                    },
                ],
            };
        },
    }
</script>

<style scoped>

</style>
