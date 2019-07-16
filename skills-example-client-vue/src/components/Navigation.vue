<template>
    <div>
        <b-navbar type="dark" variant="info">
            <b-navbar-brand href="#">Vue.js Integration Examples</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item href="#" to="/">Report Skill Events</b-nav-item>
                    <b-nav-item href="#" to="/showSkills">User Display</b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                token: '',
                version: 0,
                projectId: 'movies',
                serviceUrl: 'http://localhost:8080',
                authenticationUrl: 'http://localhost:8090/api/users/user1/token',
            };
        },
    }
</script>

<style scoped>

</style>
