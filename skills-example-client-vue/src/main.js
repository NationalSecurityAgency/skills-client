import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Multiselect from 'vue-multiselect';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import { SkillsDirective, SkillsConfiguration } from '@skills/skills-client-vue';

Vue.config.productionTip = false

Vue.component('multiselect', Multiselect);

Vue.use(BootstrapVue);
Vue.use(SkillsDirective);

axios.get("/api/config")
  .then((result) => {
    SkillsConfiguration.configure(result.data);
  })
  .then(() => {
    new Vue({
      render: h => h(App),
      router,
      store,
    }).$mount('#app');
  });
