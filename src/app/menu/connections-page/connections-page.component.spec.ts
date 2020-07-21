import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionsPageComponent } from './connections-page.component';

describe('ConnectionsPageComponent', () => {
  let component: ConnectionsPageComponent;
  let fixture: ComponentFixture<ConnectionsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
