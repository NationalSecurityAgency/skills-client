import { Injectable } from '@angular/core';

import { Example } from './example'
import { ButtonCodeExampleComponent } from './button-code-example.component';
import { InputCodeExampleComponent } from './input-code-example.component';
import { AnySkillCodeExampleComponent } from './anyskill-code-example.component';

@Injectable()
export class ExampleService {
  getExamples() {
    return [
      new Example(
        ButtonCodeExampleComponent,
        'Skills Directive - Click Event',
        'IronMan',
      ),
      new Example(
        InputCodeExampleComponent,
        'Skills Directive - Input Event',
        'Thor',
      ),
      new Example(
        ButtonCodeExampleComponent,
        'Skills Directive - Error with Button',
        'DoesNotExist',
        true
      ),
      new Example(
        InputCodeExampleComponent,
        'Skills Directive - Error with Input',
        'DoesNotExist',
        true
      ),
      new Example(
        AnySkillCodeExampleComponent,
        'Pure JS - Report Any Skill',
        '',
        true
      )
    ];
  }
}