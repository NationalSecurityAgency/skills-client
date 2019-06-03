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
                <button type="button" v-skills="'Thor'" class="btn btn-outline-primary">Report Skill</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ReportSkills"
    }
</script>

<style scoped>

</style>
