import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Multiselect from 'vue-multiselect';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import { SkillsDirective, SkillsConfiguration } from '@skills/skills-client-vue';
import VueHighlightJS from 'vue-highlightjs'

Vue.config.productionTip = false

Vue.component('multiselect', Multiselect);

Vue.use(BootstrapVue);
Vue.use(SkillsDirective);
Vue.use(VueHighlightJS)

axios.get("/api/config")
  .then((result) => {
    SkillsConfiguration.configure(result.data);
  })
  .then(() => {
    new Vue({
      render: h => h(App),
      router,
    }).$mount('#app');
  });
