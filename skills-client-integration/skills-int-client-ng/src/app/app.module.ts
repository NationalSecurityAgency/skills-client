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
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';
import { SkillsLevelModule, SkillsDisplayModule, SkilltreeModule } from '@skilltree/skills-client-ng'

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavigationComponent } from './components/navigation/navigation.component';
import { CodeExampleLayoutComponent } from './components/report-skills/code-example/code-example-layout.component';
import { ButtonCodeExampleComponent } from './components/report-skills/code-example/button-code-example.component';
import { InputCodeExampleComponent } from './components/report-skills/code-example/input-code-example.component';
import { AnySkillCodeExampleComponent } from './components/report-skills/code-example/anyskill-code-example.component';
import { ExampleService } from './components/report-skills/code-example/example.service';
import { ReportSkillsComponent } from './components/report-skills/report-skills.component';
import { SkillsDisplayComponent } from './components/skills-display/skills-display.component';
import { PlaceholderDirective } from './directives/placeholder.directive';

@NgModule({
  declarations: [
    AppComponent,
    ReportSkillsComponent,
    NavigationComponent,
    SkillsDisplayComponent,
    CodeExampleLayoutComponent,
    ButtonCodeExampleComponent,
    AnySkillCodeExampleComponent,
    InputCodeExampleComponent,
    PlaceholderDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HighlightModule,
    SkillsLevelModule,
    SkilltreeModule,
    SkillsDisplayModule,
    RouterModule.forRoot([
      { path: '', component: ReportSkillsComponent },
    ])
  ],
  providers: [ExampleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
