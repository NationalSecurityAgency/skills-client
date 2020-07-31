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
