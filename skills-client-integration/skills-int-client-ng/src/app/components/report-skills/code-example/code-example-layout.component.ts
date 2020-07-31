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
import { Component, OnInit, AfterViewInit, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { PlaceholderDirective } from 'src/app/directives/placeholder.directive';
import { Example } from './example';

@Component({
  selector: 'app-code-example-layout',
  templateUrl: './code-example-layout.component.html',
  styleUrls: ['./code-example-layout.component.css']
})
export class CodeExampleLayoutComponent implements OnInit, AfterViewInit {

  @ViewChild(PlaceholderDirective) codeExampleHost: PlaceholderDirective;

  @Input() example: Example;
  skillId: string;
  title: string;
  sampleCode: string;
  reportResult: string = "";
  
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { 
  }

  formatId(title: string) {
    return title.replace(/ /gi,'').replace(/-/g,'');
  }

  ngOnInit(): void {
    this.skillId = this.example.skillId;
    this.title = this.example.title;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.viewLoaded();
    });
  }

  viewLoaded() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.example.component);
    const viewContainerRef = this.codeExampleHost.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.example = this.example;
    this.sampleCode = componentRef.instance.getSampleCode();
    componentRef.instance.skillReportSuccess.subscribe(val => this.reportResult = JSON.stringify(val, null, ' '));
  }

}
