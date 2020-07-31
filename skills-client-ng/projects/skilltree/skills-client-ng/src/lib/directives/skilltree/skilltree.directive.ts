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
import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import debounce from 'lodash/debounce';

import {
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT
} from '@skilltree/skills-client-js';


@Directive({
  selector: '[skilltree]'
})
export class SkilltreeDirective {

  static readonly BUTTON: string = 'BUTTON';
  static readonly INPUT: string = 'INPUT';
  private nodeName: string

  constructor(private el: ElementRef) {
    this.nodeName = el.nativeElement.nodeName;
    if (this.nodeName !== SkilltreeDirective.BUTTON && this.nodeName !== SkilltreeDirective.INPUT) {
      throw `Unsupported node type [${this.nodeName}], skilltree directive only support <button> or <input> nodes.`;
    }
    this.report = debounce(this.report, 500);
  }

  @Input('skilltree') skillId: string;
  // @Output('(skills-report-success') skillReportSuccess = new EventEmitter<CustomEvent>();

  @HostListener('input', ['$event']) onInput(event) {
    if (this.nodeName == SkilltreeDirective.INPUT) {
      this.report();
    }
  }

  @HostListener('click', ['$event.target']) onClick(event) {
    if (this.nodeName == SkilltreeDirective.BUTTON) {
      this.report();
    }
  }

  report() {
    SkillsReporter.reportSkill(this.skillId)
      .then((result) => {
        const event = new CustomEvent(SUCCESS_EVENT, { detail: result });
        this.el.nativeElement.dispatchEvent(event);
        // this.skillReportSuccess.emit(event);
      })
      .catch((error) => {
        const event = new CustomEvent(FAILURE_EVENT, { detail: error });
        this.el.nativeElement.dispatchEvent(event);
      });
  }

}
