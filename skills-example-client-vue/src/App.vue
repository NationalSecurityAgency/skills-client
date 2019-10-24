<template>
    <div id="app">
        <div>
            <customizable-header></customizable-header>
            <navigation/>

            <b-container fluid class="mt-3">
                <router-view/>
            </b-container>

            <skills-footer/>

            <customizable-footer></customizable-footer>
        </div>
    </div>
</template>

<script>
    import Navigation from "./components/Navigation";
    import SkillsFooter from "./components/SkillsFooter";
    import CustomizableHeader from "./components/CustomizableHeader"
    import CustomizableFooter from "./components/CustomizableFooter"

    export default {
        name: 'app',
        components: {
            SkillsFooter,
            Navigation,
            CustomizableHeader,
            CustomizableFooter,
        },
    }
</script>

<style>
    @import "~bootstrap/dist/css/bootstrap.css";
    @import "~bootstrap-vue/dist/bootstrap-vue.css";
    @import "~vue-multiselect/dist/vue-multiselect.min.css";
    @import "~highlight.js/styles/github.css";

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .btn.disabled {
        cursor: not-allowed;
    }
</style>
