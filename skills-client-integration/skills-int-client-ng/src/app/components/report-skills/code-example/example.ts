import { Type } from "@angular/core";

export class Example {
  constructor(
    public component: Type<any>,
    public title: string,
    public skillId: string,
    // public sampleCode: string,
    public handleError: boolean = false) { }
}