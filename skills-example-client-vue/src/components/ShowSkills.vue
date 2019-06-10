<template>
    <div class="container">
        <skills-display
                :authentication-url="authenticationUrl"
                :version="version"
                :project-id="projectId"
                :service-url="serviceUrl"/>
    </div>
</template>

<script>
    import axios from 'axios';
    import { SkillsDisplay } from '@skills/skills-client-vue/src/index.js';

    export default {
        name: "ShowSkills",
        components: {SkillsDisplay},
        data() {
            return {
                token: '',
                version: 0,
                projectId: 'movies',
                serviceUrl: 'http://localhost:8080',
                authenticationUrl: 'http://localhost:8090/api/users/user1/token'
            };
        },
        mounted() {
            this.authenticationPromise = axios.get("/api/users/user1/token")
                .then((result) => {
                    this.token = result.data;
                });
        }
    }
</script>

<style scoped>

</style>
