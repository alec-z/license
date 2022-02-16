import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompatiableTableComponent } from './compatiable-table.component';

describe('CompatiableTableComponent', () => {
  let component: CompatiableTableComponent;
  let fixture: ComponentFixture<CompatiableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompatiableTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompatiableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
