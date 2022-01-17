import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LvMengComponent } from './lv-meng.component';

describe('LvMengComponent', () => {
  let component: LvMengComponent;
  let fixture: ComponentFixture<LvMengComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LvMengComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LvMengComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
