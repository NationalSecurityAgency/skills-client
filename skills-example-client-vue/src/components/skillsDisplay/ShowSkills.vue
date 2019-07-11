<template>
    <div class="container">
        <skills-display
          :options="displayOptions"
          :theme="themeObject" />
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
                themeObject: null,
                displayOptions: {
                    disableAutoScroll: true,
                },
            };
        },
        created() {
            this.themeObject = this.getSelectedTheme().theme;
        },
        methods: {
            getSelectedTheme() {
                let theme = this.$route.query.theme;
                if (!this.isValidTheme(theme)) {
                    theme = SkillsDisplayThemeFactory.default.name;
                }
                return Object.values(SkillsDisplayThemeFactory).find(it => it.name === theme);
            },

            getAvailableThemeNames() {
                return Object.values(SkillsDisplayThemeFactory).map(it => it.name);
            },

            isValidTheme(themeName) {
                return themeName && this.getAvailableThemeNames().some(it => it === themeName)
            },
        }
    }
</script>

<style scoped>
</style>
