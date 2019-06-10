<template>

    <code-example-layout :title="title" :sample-code="sampleCode">
        <div slot="code">
            <component :is="this.componentName" v-on:reporter-response="onReporterResponse"></component>
        </div>
        <span slot="res">{{reportResult}}</span>
    </code-example-layout>

</template>

<script>
    import Vue from 'vue';
    import CodeExampleLayout from "./CodeExampleLayout";

    export default {
        name: "CodeExample",
        components: {CodeExampleLayout},
        props: {
            title: String,
            sampleCode: String,
        },
        data() {
            return {
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

<style lang="scss" >
    @import "../../node_modules/bootstrap/scss/bootstrap";

    .code-example button {
        @extend .btn;
        @extend .btn-outline-primary;
    }

    .code-example input {
        @extend  .form-control;
    }
</style>
