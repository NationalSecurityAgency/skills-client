<template>
    <div id="app">
        <navigation/>

        <b-container fluid class="mt-3">
            <router-view/>
        </b-container>

        <skills-footer/>
    </div>
</template>

<script>
    // import ShowSkills from "./components/ShowSkills";
    import Navigation from "./components/Navigation";
    import SkillsFooter from "./components/SkillsFooter";

    export default {
        name: 'app',
        components: {
            SkillsFooter,
            Navigation,
            // ShowSkills,
        }
    }
</script>

<style>
    @import "~bootstrap/dist/css/bootstrap.css";
    @import "~bootstrap-vue/dist/bootstrap-vue.css";
    @import "~vue-multiselect/dist/vue-multiselect.min.css";

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .btn.disabled {
        cursor: not-allowed;
    }
</style>
