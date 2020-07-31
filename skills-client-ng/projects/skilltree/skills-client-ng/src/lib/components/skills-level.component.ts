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
import { Component, OnInit, Input, AfterViewChecked } from '@angular/core';
// @ts-ignore
import { SkillsConfiguration, SkillsLevelJS } from '@skilltree/skills-client-js'

@Component({
  selector: 'skills-level',
  template: `
    <div [hidden]="getSkillLevel() === null">
        <span id="skills-level-text-display" className="skills-level-text-display"></span>
    </div>
  `,
  styles: [
  ]
})
export class SkillsLevelComponent implements OnInit {
  skillLevelJS: any
  skillLevel: string

  @Input() projectId: string;
  constructor() { }

  ngOnInit(): void {
    SkillsConfiguration.afterConfigure()
      .then(() => {
        this.skillLevelJS = new SkillsLevelJS(this.getProjectId());
        this.skillLevelJS.attachTo(document.getElementById('skills-level-text-display'));
      });
  }

  getProjectId() {
    let projectId = this.projectId;
    if (!projectId) {
      projectId = SkillsConfiguration.getProjectId();
    }
    return projectId;
  }

  getSkillLevel() {
    let skillLevel = null;
    if (this.skillLevelJS && this.skillLevelJS.skillLevel !== undefined) {
      skillLevel = this.skillLevelJS.skillLevel;
    }
    return skillLevel;
  }

}
