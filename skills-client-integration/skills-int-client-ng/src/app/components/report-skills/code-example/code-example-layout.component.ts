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
