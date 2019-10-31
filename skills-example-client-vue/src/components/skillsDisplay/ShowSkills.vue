<template>
  <div class="container">
    <div class="d-flex align-items-center">
      <b-dropdown
        id="dropdown-1"
        class="mb-3"
        text="Change Theme"
        variant="outline-primary">
        <b-dropdown-item
          v-for="themeItem in themes"
          @click="setIsThemeUrlParam(themeItem)"
          :key="themeItem.name"
          :active="selectedTheme.name === themeItem.name">
          {{ themeItem.name }}
        </b-dropdown-item>
      </b-dropdown>
        <b-form-checkbox class="d-inline-block ml-3 border-right pr-2"
                v-model="displayOptions.isSummaryOnly"
                switch>
            Summary Only
        </b-form-checkbox>

      <b-link
        class="ml-2"
        href="javascript:void"
        v-scroll-to="'#sample-code'"
        @click="showSampleCode = true">Show Source</b-link>
    </div>
    <div class="border rounded">
      <skills-display
        v-if="selectedTheme"
        :options="displayOptions"
        :theme="selectedTheme.theme"/>
    </div>
    <div
      v-if="selectedTheme && showSampleCode"
      id="sample-code"
      class="row">
      <div class="col-12">
        <div class="mb-5 mt-5 card bg-light">
          <h5 class=" card-header text-info">
            <strong>Sample Code</strong>
          </h5>
          <div class="card-body py-0">
<!--              // keep <template> and <script> tags separate, as one requires html highlighting and other javascript-->
            <pre v-highlightjs class="m-0 p-0">
                <code class="html m-0 p-0">
&lt;template&gt;
   &lt;skills-level /&gt; &lt;!-- You can display the user's current Level using the SkillsLevel component --&gt;
   &lt;skills-display :theme="selectedTheme" {{ this.displayOptions.isSummaryOnly ? ':options="displayOptions"' : '' }}/&gt;
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
          isSummaryOnly: this.$route.query.isSummaryOnly ? JSON.parse(this.$route.query.isSummaryOnly) : false,
        },
        showSampleCode: false,
        themes: this.getThemes(),
        selectedTheme: this.$route.query.themeName ? this.findTheme(this.$route.query.themeName) : this.getThemes()[0],
      };
    },
    computed: {
      sampleCode() {
        return beautify(`import { SkillsDisplay, SkillsLevel } from '@skills/skills-client-vue';

                export default {
                  components: {
                    SkillsDisplay,
                  },
                  data() {
                    return { ${this.displayOptions.isSummaryOnly ? '\ndisplayOptions: { isSummaryOnly: true, },' : ''}
                      selectedTheme: ${JSON.stringify(this.selectedTheme)}
                    };
                  },
                };`, {indent_size: 2, indent_level: 1, end_with_newline: false});
      },
    },
    watch: {
      'displayOptions.isSummaryOnly'() {
        this.setIsSummaryOnlyUrlParam();
      },
    },
    methods: {
      getThemes() {
        return Object.values(SkillsDisplayThemeFactory);
      },

      refreshPage() {
        setTimeout(() => {
          document.location.reload();
        }, 250);
      },

      setIsThemeUrlParam(theme) {
        this.$router.push({query: {themeName: theme.name, isSummaryOnly: this.displayOptions.isSummaryOnly}});
        this.refreshPage();
      },

      setIsSummaryOnlyUrlParam() {
        this.$router.push({
          query: {
            themeName: this.selectedTheme.name,
            isSummaryOnly: this.displayOptions.isSummaryOnly
          }
        });
        this.refreshPage();
      },

      findTheme(name) {
        return this.getThemes().find((item) => item.name === name);

      },
    },
  }
</script>
