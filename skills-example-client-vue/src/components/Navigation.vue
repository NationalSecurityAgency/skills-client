<template>
    <div>
        <b-navbar type="dark" variant="info">
            <b-navbar-brand href="#">Vue.js Integration Examples</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item href="#" to="/">Report Skill Events</b-nav-item>
                    <b-nav-item href="#" to="/showSkills">User Display</b-nav-item>
                    <div v-if="$route.path === '/showSkills'">
                        <b-nav-item-dropdown class="ml-5 font-weight-bold" text="Change Theme">
                            <b-dropdown-item
                                v-for="themeName in themeNames"
                                :key="themeName"
                                :active="theme === themeName"
                                :href="`/showSkills?theme=${themeName}`">
                                {{ themeName }}
                            </b-dropdown-item>
                        </b-nav-item-dropdown>
                    </div>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
    import SkillsDisplayThemeFactory from './skillsDisplay/ThemeFactory.js';

    export default {
        data() {
            return {
                token: '',
                version: 0,
                projectId: 'movies',
                serviceUrl: 'http://localhost:8080',
                authenticationUrl: 'http://localhost:8090/api/users/user1/token',
                themeNames: this.getAvailableThemeNames(),
                theme: this.$route.query.theme,
            };
        },
        methods: {
            getAvailableThemeNames() {
                return Object.values(SkillsDisplayThemeFactory).map(it => it.name);
            },
        },
    }
</script>

<style scoped>

</style>
