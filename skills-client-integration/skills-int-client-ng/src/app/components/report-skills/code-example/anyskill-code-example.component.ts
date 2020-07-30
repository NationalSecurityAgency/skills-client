import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import axios from 'axios';
import { Example } from './example';
import { SkillsReporter } from '@skilltree/skills-client-ng';

@Component({
  selector: 'app-anyskill-code-example',
  templateUrl: './anyskill-code-example.component.html',
  styleUrls: ['./anyskill-code-example.component.css']
})
export class AnySkillCodeExampleComponent implements OnInit {

  @Input() example: Example
  placeholder: string = 'Select a skill id';
  skillId: string;
  available: string[] = [''];

  @Output() skillReportSuccess = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit(): void {
    this.skillId = this.placeholder;

    axios.get("/api/skills")
    .then((result) => {
        this.available = result.data;
    });
  }

  hasSelectedSkill() {
    return this.skillId && this.skillId !== this.placeholder;
  }

  setSelectedSkill(selectedSkill: string) {
    this.skillId = selectedSkill;
  }

  reportSkill() {
    SkillsReporter.reportSkill(this.skillId)
        .then((res) => {
          this.skillReportSuccess.emit(res);
        })
        .catch((res) => {
          this.skillReportSuccess.emit(res);
        });
  }

  getSampleCode() {
    let sampleCode = `SkillsReporter.reportSkill(this.skill)
    .then((res) => {
        this.reportResult = res;
    });`
    sampleCode = 'SkillsReporter.reportSkill(this.skill)\n  .then((res) => {\n    this.reportResult = res;\n  \});';
    return sampleCode
  }
}
