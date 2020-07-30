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
