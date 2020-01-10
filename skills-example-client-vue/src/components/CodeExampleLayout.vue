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
