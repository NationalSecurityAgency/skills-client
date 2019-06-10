<template>
    <div>
        <h5 class="text-info"><strong>{{ title }}</strong></h5>
        <div class="card card-body bg-light">
            <code>{{ sampleCode }}</code>
        </div>
        <div class="card card-body mt-3">
            <div id="exampleDirectiveClickEvent">
                <component :is="this.componentName" v-on:reporter-response="onReporterResponse"></component>
            </div>
            <hr>
            <div class="text-primary">Result:</div>
            <div class="border rounded p-3 bg-light">
                    <pre>{{reportResult}}</pre>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';

    export default {
        name: "CodeExample",
        props: {
            title: String,
            sampleCode: String,

        },
        data() {
            return {
                theCode: null,
                reportResult: null,
                componentName: '',
            };
        },
        mounted() {
            this.componentName = this.title.replace( /\s/g, '');
            Vue.component(this.componentName, {
                template: `<div class="code-example">${this.sampleCode}</div>`,
                methods: {
                    onReporterResponse(response) {
                        this.$emit('reporter-response', response);
                    },
                },
            });
        },
        methods: {
            onReporterResponse(response) {
                this.reportResult = response.detail;
            },
        },
    }
</script>

<style>
    .code-example button {
        transition:none;
        color: #007bff;
        border-color: #007bff;
    }
</style>
