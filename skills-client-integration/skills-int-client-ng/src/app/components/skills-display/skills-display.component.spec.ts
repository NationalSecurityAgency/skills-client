import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsDisplayComponent } from './skills-display.component';

describe('SkillsDisplayComponent', () => {
  let component: SkillsDisplayComponent;
  let fixture: ComponentFixture<SkillsDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillsDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
