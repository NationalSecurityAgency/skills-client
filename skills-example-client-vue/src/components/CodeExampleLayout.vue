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
    <div>
        <h5 class="text-info"><strong>{{ title }}</strong></h5>
        <div class="card card-body bg-light">
            <pre v-highlightjs="sampleCode"><code :class="codeType"></code></pre>
        </div>
        <div class="card card-body mt-3" :id="title.replace(/ /gi,'').replace(/-/g,'')">
            <div id="exampleDirectiveClickEvent">
                <slot name="code"/>
            </div>
            <hr>
            <div class="text-primary">Result:</div>
            <div class="border rounded p-3 bg-light">
                <pre><slot name="res"/></pre>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "CodeExampleLayout",
        props: {
            title: String,
            sampleCode: String,
            codeType: {
                type: String,
                default: 'html',
            },
        },
    }
</script>

<style scoped>

</style>
