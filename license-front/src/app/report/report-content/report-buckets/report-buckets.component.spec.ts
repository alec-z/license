import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBucketsComponent } from './report-buckets.component';

describe('ReportBucketsComponent', () => {
  let component: ReportBucketsComponent;
  let fixture: ComponentFixture<ReportBucketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportBucketsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBucketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
