import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common"
import { SkillsLevelComponent } from './skills-level.component';



@NgModule({
  declarations: [SkillsLevelComponent],
  imports: [
    CommonModule
  ],
  exports: [SkillsLevelComponent]
})
export class SkillsLevelModule { }
