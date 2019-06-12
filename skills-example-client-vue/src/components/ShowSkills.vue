<template>
    <div class="container">
        <skills-display
                :version="version"/>
    </div>
</template>

<script>
    import axios from 'axios';
    import { SkillsDisplay } from '@skills/skills-client-vue';

    export default {
        name: "ShowSkills",
        components: {SkillsDisplay},
        data() {
            return {
                token: '',
                version: 0,
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
