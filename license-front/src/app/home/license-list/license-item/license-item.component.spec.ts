import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseItemComponent } from './license-item.component';

describe('LicenseItemComponent', () => {
  let component: LicenseItemComponent;
  let fixture: ComponentFixture<LicenseItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LicenseItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
