import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common"
import { SkillsDisplayComponent } from './skills-display.component';



@NgModule({
  declarations: [SkillsDisplayComponent],
  imports: [
    CommonModule
  ],
  exports: [SkillsDisplayComponent]
})
export class SkillsDisplayModule { }
