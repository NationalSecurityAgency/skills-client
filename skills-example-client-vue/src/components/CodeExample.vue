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

    <code-example-layout :title="title" :sample-code="sampleCode">
        <div slot="code">
            <component :is="this.componentName" v-on:reporter-error="onReporterError" v-on:reporter-response="onReporterResponse"></component>
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

                    onReporterError(error) {
                        this.$emit('reporter-error', error);
                    },
                },
            });
        },
        methods: {
            onReporterResponse(response) {
                this.reportResult = response.detail;
            },
            onReporterError(response) {
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
