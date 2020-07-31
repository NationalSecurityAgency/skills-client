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
import { SkilltreeDirective } from './skilltree.directive';
import { ElementRef } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';

export class MockElementRef extends ElementRef {
  constructor() { super(null); }
}


describe('SkilltreeDirective', () => {

  it('should create an instance', () => {
    const directive = new SkilltreeDirective(new MockElementRef());
    expect(directive).toBeTruthy();
  });
});
