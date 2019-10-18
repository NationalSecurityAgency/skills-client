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
          @click="refreshPage"
          :key="themeName"
          :active="themeObject.name === themeName"
          :href="`#showSkills?theme=${themeName}`">
          {{ themeName }}
        </b-dropdown-item>
      </b-dropdown>
      <b-link
        class="ml-4"
        href="javascript:void"
        v-scroll-to="'#sample-code'"
        @click="showSampleCode = true">Show Source</b-link>
    </div>
    <div
      style="min-height: 860px">
      <skills-display
        v-if="themeObject"
        :options="displayOptions"
        :theme="themeObject.theme"/>
    </div>
    <div
      v-if="themeObject && showSampleCode"
      id="sample-code"
      class="row">
      <div class="col-md-6 offset-md-3 col-12">
        <div class="mb-5 mt-5 card bg-light">
          <h5 class=" card-header text-info">
            <strong>Sample Code</strong>
          </h5>
          <div class="card-body py-0">
<!--              // keep <template> and <script> tags separate, as one requires html highlighting and other javascript-->
            <pre v-highlightjs class="m-0 p-0">
                <code class="html m-0 p-0">
&lt;template&gt;
   &lt;skills-display :theme="themeObject"/&gt;
&lt;/template&gt;

&lt;script&gt;</code></pre><pre v-highlightjs class="m-0 p-0">
                <code class="javascript p-0 m-0">{{ sampleCode }}
&lt;/script&gt;
                </code>
            </pre>
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

    const beautify = require('js-beautify').js;

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
                    autoScrollStrategy: 'top-of-page',
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
            },

            sampleCode() {
              return beautify(`import { SkillsDisplay } from '@skills/skills-client-vue';

                export default {
                  components: {
                    SkillsDisplay,
                  },
                  data() {
                    return {
                      themeObject: ${JSON.stringify(this.themeObject.theme)}
                    };
                  },
                };`, { indent_size: 2, indent_level: 1, end_with_newline: false });
            },
        },
        methods: {
            refreshPage() {
              setTimeout(() => {
                document.location.reload();
              }, 0);
            },

            getAvailableThemeNames() {
                return Object.values(SkillsDisplayThemeFactory).map(it => it.name);
            },
        },
    }
</script>

<style scoped>
</style>
