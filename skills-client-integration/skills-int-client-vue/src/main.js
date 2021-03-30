/*
 * Copyright 2020 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Multiselect from 'vue-multiselect';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import { SkillsDirective, SkillsConfiguration, Logger } from '@skilltree/skills-client-vue';
import VueHighlightJS from 'vue-highlightjs'

Vue.config.productionTip = false

Vue.component('multiselect', Multiselect);

Vue.use(BootstrapVue);
Vue.use(SkillsDirective);
Vue.use(VueHighlightJS)

axios.get("/api/config")
  .then((result) => {
    SkillsConfiguration.configure(result.data);
    SkillsConfiguration.configure(result.data);
    SkillsConfiguration.configure(result.data);
  })
  .then(() => {
    SkillsConfiguration.afterConfigure().then(() => {
      console.log('afterConfigure() - this should only be called once!');
      if (window.Cypress) {
        window.skillsLogger = Logger;
      }
      new Vue({
        render: h => h(App),
        router,
      }).$mount('#app');
    })
  });
