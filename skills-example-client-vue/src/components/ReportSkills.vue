<template>
    <div>
        <h2>Report Skills</h2>

        <div class="row">
            <div class="col border rounded p-4 m-2">
                <div>
                    <pre><code>{{ this.value}}</code></pre>
                </div>
            </div>
            <div class="col border rounded">
                <button type="button" v-skills="'IronMan'" @skills-report-response="onReporterResponse" class="btn btn-outline-primary">Report Skill</button>
            </div>

            <input type="text" v-skills:input="'Thorr'" @skills-report-response="onReporterResponse" >
        </div>
        <br/>
        <div v-if="reportResult">
            Report result:<br/>
            <pre>{{ reportResult }}</pre>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ReportSkills",
        data() {
            return {
                reportResult: null,
                value: '<button type="button" v-skills="\'Thor\'" class="btn btn-outline-primary">Report Skill</button>',
            };
        },
        methods: {
            onReporterResponse(response) {
                this.reportResult = response.detail;
            }
        },
    }
</script>

<style scoped>

</style>
