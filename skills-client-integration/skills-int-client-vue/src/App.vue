/*
Copyright 2020 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
<template>
    <div id="app">
        <div>
            <customizable-header></customizable-header>
            <navigation/>

            <b-container fluid class="mt-3">
                <div v-if="cacheComponents">
                    <report-skills v-show="isPage('ReportSkills')"/>
                    <show-skills v-show="isPage('ShowSkills')"/>
                </div>
                <div v-else>
                    <router-view/>
                </div>
            </b-container>

            <skills-footer/>

            <customizable-footer></customizable-footer>
        </div>
    </div>
</template>

<script>
  import Navigation from "./components/Navigation";
  import SkillsFooter from "./components/SkillsFooter";
  import CustomizableHeader from "./components/CustomizableHeader"
  import CustomizableFooter from "./components/CustomizableFooter"
  import ReportSkills from './components/ReportSkills';
  import ShowSkills from './components/skillsDisplay/ShowSkills';

  export default {
    name: 'app',
    components: {
      SkillsFooter,
      Navigation,
      CustomizableHeader,
      CustomizableFooter,
      ReportSkills,
      ShowSkills,
    },
    computed: {
      cacheComponents() {
        return this.$route.query.refreshPage === "false" || this.$route.query.refreshPage === false;
      },
    },
    methods: {
      isPage(component) {
        return this.$route.name === component;
      }
    },
  }
</script>

<style>
    @import "~bootstrap/dist/css/bootstrap.css";
    @import "~bootstrap-vue/dist/bootstrap-vue.css";
    @import "~vue-multiselect/dist/vue-multiselect.min.css";
    @import "~highlight.js/styles/github.css";

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .btn.disabled {
        cursor: not-allowed;
    }
</style>
