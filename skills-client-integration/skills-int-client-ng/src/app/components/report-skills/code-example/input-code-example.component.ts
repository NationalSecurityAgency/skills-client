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
import { Example } from './example';

@Component({
  selector: 'app-input-code-example',
  templateUrl: './input-code-example.component.html',
  styleUrls: ['./input-code-example.component.css']
})
export class InputCodeExampleComponent implements OnInit {

  @Input() example: Example
  skillId: string

  @Output() skillReportSuccess = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit(): void {
    this.skillId = this.example.skillId;
  }

  onReporterResponse(event) {
    this.skillReportSuccess.emit(event.detail)
  }

  getSampleCode() {
    let sampleCode = `<input \n type="text" \n [skilltree]="\'${this.example.skillId}\'" \n (skills-report-success)="onReporterResponse($event)"`;
    if (this.example.handleError) {
      sampleCode += '\n (skills-report-error)="onReporterError($event)"';
    }
    sampleCode += ' />'
    return sampleCode;
  }
}
