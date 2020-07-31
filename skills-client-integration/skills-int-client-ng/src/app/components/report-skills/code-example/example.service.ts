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