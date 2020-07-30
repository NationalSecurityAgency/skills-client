import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSkillsComponent } from './report-skills.component';

describe('ReportSkillsComponent', () => {
  let component: ReportSkillsComponent;
  let fixture: ComponentFixture<ReportSkillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportSkillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
