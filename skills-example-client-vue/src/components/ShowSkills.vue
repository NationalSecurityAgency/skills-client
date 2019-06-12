<template>
    <div class="container">
        <skills-display />
    </div>
</template>

<script>
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
    }
</script>

<style scoped>
</style>
