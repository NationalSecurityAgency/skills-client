<template>
    <div>
        <h2>Report Skills</h2>

        <div class="row">
            <div class="col border rounded">
                <div>
                <pre><code><button type="button" class="btn btn-outline-primary">Report Skill</button></code></pre>
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
