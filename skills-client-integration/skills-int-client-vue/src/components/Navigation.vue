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
    <div>
        <b-navbar type="dark" variant="info">
            <b-navbar-brand href="#">Vue.js Integration Examples</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item href="#" :to="{ name: 'ReportSkills', query: { refreshPage: this.refreshPage } }" :class="{ active: isPage('ReportSkills') }" data-cy="reportSkillsLink">Report Skill Events</b-nav-item>
                    <b-nav-item href="#" :to="{ name: 'ShowSkills', query: { refreshPage: this.refreshPage } }" class="d-inline-block mr-3 border-right pr-2" :class="{ active: isPage('ShowSkills') }" data-cy="userDisplayLink">User Display</b-nav-item>
                    <b-nav-form>
                        <b-form-checkbox v-model="refreshPage"
                                         class="nav-label"
                                         :class="{ active: refreshPage }"
                                         switch
                                         data-cy="refresh">
                            Refresh on Load
                        </b-form-checkbox>
                    </b-nav-form>
                </b-navbar-nav>
            </b-collapse>
            <button
              @click="$router.push('/showSkills')"
              class="btn btn-primary level"><skills-level /></button>
        </b-navbar>

    </div>
</template>

<script>
  import {SkillsLevel} from '@skilltree/skills-client-vue';

  export default {
    components: {
      SkillsLevel,
    },
    data() {
      return {
        token: '',
        version: 0,
        projectId: 'movies',
        serviceUrl: 'http://localhost:8080',
        authenticationUrl: 'http://localhost:8090/api/users/user1/token',
        refreshPage: this.$route.query.refreshPage !== "false",
      };
    },
    methods: {
      isPage(component) {
        return this.$route.name === component;
      }
    },
  }
</script>

<style scoped>
    .nav-label {
        color: rgba(255, 255, 255, 0.5);
    }
    .active {
        color: rgba(255, 255, 255, 1);
    }
    .level {
        min-width: 4rem;
        min-height: 2rem;
    }
</style>
