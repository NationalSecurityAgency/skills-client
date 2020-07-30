import { Component, OnInit, Input, OnDestroy } from '@angular/core';
// @ts-ignore
import { SkillsDisplayJS } from '@skilltree/skills-client-js'

@Component({
  selector: 'skills-display',
  template: `
    <div id="clientDisplayContainer"></div>
  `,
  styles: [
  ]
})
export class SkillsDisplayComponent implements OnInit, OnDestroy {
  clientDisplay: any

  @Input() options: any;
  @Input() version: number;
  @Input() theme: string;
  @Input() userId: string;
  constructor() { }

  ngOnInit(): void {
    this.clientDisplay = new SkillsDisplayJS({
      options: this.options,
      version: this.version,
      theme: this.theme,
      userId: this.userId,
    });
    this.clientDisplay.attachTo(document.getElementById('clientDisplayContainer'));
  }

  ngOnDestroy(): void {
    if (this.clientDisplay) {
      this.clientDisplay.destroy();
    }
  }
}
