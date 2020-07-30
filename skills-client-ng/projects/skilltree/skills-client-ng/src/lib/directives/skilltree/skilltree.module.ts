import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkilltreeDirective } from './skilltree.directive';



@NgModule({
  declarations: [SkilltreeDirective],
  imports: [
    CommonModule
  ],
  exports: [SkilltreeDirective]
})
export class SkilltreeModule { }
