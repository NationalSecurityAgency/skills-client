import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsLevelComponent } from './skills-level.component';

describe('SkillsLevelComponent', () => {
  let component: SkillsLevelComponent;
  let fixture: ComponentFixture<SkillsLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillsLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
