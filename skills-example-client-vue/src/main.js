import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Multiselect from 'vue-multiselect';
import App from './App.vue';
import router from './router';
import { SkillsDirective } from '@skills/skills-client-vue/src/index.js';
import SkillsReporter from '@skills/skills-client-reporter';
import SkillsConfiguration from '@skills/skills-client-configuration';

Vue.config.productionTip = false

Vue.component('multiselect', Multiselect);

Vue.use(BootstrapVue)
Vue.use(SkillsDirective)

const serviceUrl = 'http://localhost:8080';
const projectId = 'movies';
const authenticator = 'http://localhost:8090/api/users/user1/token';
SkillsConfiguration.configure(serviceUrl, projectId, authenticator)

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')




