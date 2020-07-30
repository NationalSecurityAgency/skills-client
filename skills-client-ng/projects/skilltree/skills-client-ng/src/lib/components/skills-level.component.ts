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
