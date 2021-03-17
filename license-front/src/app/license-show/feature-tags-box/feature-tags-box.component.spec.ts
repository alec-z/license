import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureTagsBoxComponent } from './feature-tags-box.component';

describe('FeatureTagsBoxComponent', () => {
  let component: FeatureTagsBoxComponent;
  let fixture: ComponentFixture<FeatureTagsBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeatureTagsBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureTagsBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
