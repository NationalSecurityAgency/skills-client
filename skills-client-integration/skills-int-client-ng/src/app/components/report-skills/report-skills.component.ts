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
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ComponentFactoryResolver,
  ViewChildren,
  ViewContainerRef,
  QueryList,
  ChangeDetectorRef
} from '@angular/core';
import { Example } from './code-example/example'
import { ExampleService } from './code-example/example.service';
import { CodeExampleLayoutComponent } from './code-example/code-example-layout.component'
import { SkillsReporter } from '@skilltree/skills-client-ng';

@Component({
  selector: 'app-report-skills',
  templateUrl: './report-skills.component.html',
  styleUrls: ['./report-skills.component.css']
})
export class ReportSkillsComponent implements OnInit, AfterViewInit, OnDestroy {

  globalEventResult: string = ''
  examples: Example[]
  private loadedComponents = [];

  @ViewChildren('examplesTarget', { read: ViewContainerRef }) exampleTargets: QueryList<ViewContainerRef>;

  constructor(private exampleService: ExampleService, private componentFactoryResolver: ComponentFactoryResolver, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    SkillsReporter.addSuccessHandler(result => {
      this.globalEventResult = JSON.stringify(result, null, ' ')

      // force change detection
      this.ref.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.viewLoaded();
    });
  }

  ngOnDestroy(): void {
    this.loadedComponents.forEach(component => component.destroy());
  }

  async viewLoaded() {
    this.exampleTargets.changes.subscribe(() => {
      this.loadExampleComponents();
    });
    await this.loadExamples();
  }

  async loadExamples() {
    this.examples = this.exampleService.getExamples();
  }

  private loadExampleComponents() {
    this.exampleTargets.toArray().forEach((viewContainerRef, i) => {
      let example = this.examples[i];
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(CodeExampleLayoutComponent);
      let componentRef = viewContainerRef.createComponent(componentFactory);
      componentRef.instance.example = example;
      componentRef.changeDetectorRef.detectChanges();
      this.loadedComponents.push(componentRef);
    });
  }
}
