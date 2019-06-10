<template>
    <div>
        <code-example-layout :title="title" :sample-code="sampleCode">
            <div slot="code">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="Skill Id" aria-label="SkillId" aria-describedby="basic-addon2" v-model="skill">
                    <div class="input-group-append">
                        <button class="btn btn-outline-primary" type="button" @click="reportSkill">Report Skill</button>
                    </div>
                </div>
            </div>
            <span slot="res">{{reportResult}}</span>
        </code-example-layout>
    </div>
</template>

<script>
    import SkillsReporter from '@skills/skills-client-reporter';
    import CodeExampleLayout from "./CodeExampleLayout";

    export default {
        name: "ReportAnySkill",
        components: {CodeExampleLayout},
        data() {
            return {
                title: 'Pure JS - Report Any Skill',
                reportResult: '',
                sampleCode: 'reportSkill() {\n' +
                    '                SkillsReporter.reportSkill(this.skill)\n' +
                    '                    .then((res) => {\n' +
                    '                        this.reportResult = res;\n' +
                    '                    });\n' +
                    '            },',
                skill: '',
            };
        },
        methods: {
            reportSkill() {
                SkillsReporter.reportSkill(this.skill)
                    .then((res) => {
                        this.reportResult = res;
                    });
            },
        },
    }
</script>

<style scoped>

</style>
