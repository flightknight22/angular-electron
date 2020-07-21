import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TvTunerComponent } from './tv-tuner.component';

describe('TvTunerComponent', () => {
  let component: TvTunerComponent;
  let fixture: ComponentFixture<TvTunerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TvTunerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TvTunerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
