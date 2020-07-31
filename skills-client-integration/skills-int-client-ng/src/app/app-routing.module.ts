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
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportSkillsComponent } from './components/report-skills/report-skills.component';
import { SkillsDisplayComponent } from './components/skills-display/skills-display.component';


const routes: Routes = [{
  path: '',
  redirectTo: 'angular/reportSkills',
  pathMatch: 'full'
}, {
  path: 'angular/reportSkills',
  component: ReportSkillsComponent
}, {
  path: 'angular/showSkills',
  component: SkillsDisplayComponent
},
{ path: '**', component: ReportSkillsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
