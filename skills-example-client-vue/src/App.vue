<template>
    <div id="app">
        <navigation/>

        <b-container fluid class="mt-3">
            <router-view/>
        </b-container>
    </div>
</template>

<script>
    // import ShowSkills from "./components/ShowSkills";
    import Navigation from "./components/Navigation";

    export default {
        name: 'app',
        components: {
            Navigation,
            // ShowSkills,
        }
    }
</script>

<style>
    @import "~bootstrap/dist/css/bootstrap.css";
    @import "~bootstrap-vue/dist/bootstrap-vue.css";

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>
