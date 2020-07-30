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
