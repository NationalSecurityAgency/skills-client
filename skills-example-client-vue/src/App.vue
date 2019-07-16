<template>
    <div id="app">
        <div :style="{ 'background-color': backgroundColor }">
            <navigation/>

            <b-container fluid class="mt-3">
                <router-view/>
            </b-container>

            <skills-footer/>
        </div>
    </div>
</template>

<script>
    import Navigation from "./components/Navigation";
    import SkillsFooter from "./components/SkillsFooter";

    export default {
        name: 'app',
        components: {
            SkillsFooter,
            Navigation,
        },
        computed: {
            backgroundColor() {
                let backgroundColor = 'white';
                if (this.$route.path === '/showSkills') {
                    const theme = this.$store.getters.skillsDisplayTheme;
                    const themeBackground = theme.theme.backgroundColor;
                    if (themeBackground) {
                        backgroundColor = themeBackground.value;
                    }
                }
                return backgroundColor;
            },
        },
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
