import { Component, OnInit, AfterViewInit, OnDestroy, ComponentFactoryResolver, ViewChildren, ViewContainerRef, QueryList } from '@angular/core';
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

  constructor(private exampleService: ExampleService, private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    SkillsReporter.addSuccessHandler(result => {
      this.globalEventResult = JSON.stringify(result, null, ' ')
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
