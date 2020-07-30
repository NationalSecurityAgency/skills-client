import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Example } from './example';

@Component({
  selector: 'app-button-code-example',
  templateUrl: './button-code-example.component.html',
  styleUrls: ['./button-code-example.component.css']
})
export class ButtonCodeExampleComponent implements OnInit {

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
    let sampleCode = `<button \n [skilltree]="\'${this.example.skillId}\'" \n (skills-report-success)="onReporterResponse($event)"`;    
    if (this.example.handleError) {
      sampleCode += '\n (skills-report-error)="onReporterError($event)"';
    }
    sampleCode += '>\n  Report Skill\n</button>'
    return sampleCode
  }
}
