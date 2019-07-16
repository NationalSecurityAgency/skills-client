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
      <b-link
        class="ml-4"
        href="javascript:void"
        v-scroll-to="'#sample-code'"
        @click="showSampleCode = true">Show Theme Object</b-link>
    </div>
    <skills-display
      v-if="themeObject"
      :options="displayOptions"
      :theme="themeObject.theme"/>
    <div
      v-if="themeObject && showSampleCode"
      id="sample-code"
      class="row">
      <div class="col-md-6 offset-md-3 col-12">
        <div class="mb-5 card bg-light">
          <h5 class=" card-header text-info">
            <strong>Theme Object</strong>
          </h5>
          <div class="card-body">
            <pre><code>{{ themeObject.theme }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import { SkillsDisplay } from '@skills/skills-client-vue';
    import SkillsDisplayThemeFactory from './ThemeFactory.js';

    import Vue from 'vue';
    import VueScrollTo from 'vue-scrollto';

    Vue.use(VueScrollTo);

    Vue.use(VueScrollTo, {
        container: "body",
        duration: 1000,
        easing: "ease",
        offset: 0,
        force: true,
        cancelable: true,
        onStart: false,
        onDone: false,
        onCancel: false,
        x: false,
        y: true,
    });

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
                showSampleCode: false,
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
