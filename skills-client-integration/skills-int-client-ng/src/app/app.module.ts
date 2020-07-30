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
