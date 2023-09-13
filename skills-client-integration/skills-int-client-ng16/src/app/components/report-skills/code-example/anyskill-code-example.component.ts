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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import axios from 'axios';
import { Example } from './example';
import { SkillsReporter } from '@skilltree/skills-client-ng16';

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
        this.available = result.data as string[];
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
    });`;
    sampleCode = 'SkillsReporter.reportSkill(this.skill)\n  .then((res) => {\n    this.reportResult = res;\n  \});';
    return sampleCode;
  }
}
