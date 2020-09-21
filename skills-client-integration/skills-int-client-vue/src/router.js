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
import Router from 'vue-router';
import ReportSkills from './components/ReportSkills';
import ShowSkills from './components/skillsDisplay/ShowSkills';
import ProxyShowSkills from "@/components/skillsDisplay/ProxyShowSkills";

Vue.use(Router);

const router = new Router({
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
        {
            path: '/proxyShowSkills',
            name: 'ProxyShowSkills',
            component: ProxyShowSkills,
        }
    ]
});

export default router;
