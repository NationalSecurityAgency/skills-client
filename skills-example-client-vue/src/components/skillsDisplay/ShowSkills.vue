<template>
    <div class="container">
        <div>
            <b-dropdown
              id="dropdown-1"
              class="mb-3"
              text="Change Theme"
              variant="outline-primary">
                <b-dropdown-item
                  v-for="themeName in themeNames"
                  :key="themeName"
                  :active="themeObject.name === themeName"
                  :href="`/showSkills?theme=${themeName}`">
                    {{ themeName }}
                </b-dropdown-item>
            </b-dropdown>
        </div>
        <skills-display
            v-if="themeObject"
            :options="displayOptions"
            :theme="themeObject.theme" />
    </div>
</template>

<script>
    import { SkillsDisplay } from '@skills/skills-client-vue';
    import SkillsDisplayThemeFactory from './ThemeFactory.js';

    export default {
        components: {
            SkillsDisplay,
        },
        data() {
            return {
                token: '',
                version: 0,
                displayOptions: {
                    disableAutoScroll: true,
                },
                themeNames: this.getAvailableThemeNames(),
            };
        },
        created() {
            const theme = this.themeObject;
            this.$store.commit('skillsDisplayThemeName', theme.name);
        },
        computed: {
            themeObject() {
                return this.$store.getters.skillsDisplayTheme;
            }
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
