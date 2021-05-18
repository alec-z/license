import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFunctionComponent } from './auth-function.component';

describe('AuthFunctionComponent', () => {
  let component: AuthFunctionComponent;
  let fixture: ComponentFixture<AuthFunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthFunctionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
