import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFileListComponent } from './report-file-list.component';

describe('ReportFileListComponent', () => {
  let component: ReportFileListComponent;
  let fixture: ComponentFixture<ReportFileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportFileListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
