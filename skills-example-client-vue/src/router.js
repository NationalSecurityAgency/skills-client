import Vue from 'vue';
import Router from 'vue-router';
import ReportSkills from './components/ReportSkills';
import ShowSkills from './components/skillsDisplay/ShowSkills';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    base: 'vuejs',
    routes: [
        {
            path: '/',
            name: 'ReportSkills',
            component: ReportSkills,
        },
        {
            path: '/showSkills',
            name: 'ShowSkills',
            component: ShowSkills,
        },
    ]
});

export default router;
