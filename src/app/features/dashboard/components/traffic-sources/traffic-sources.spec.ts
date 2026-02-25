import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficSources } from './traffic-sources';

describe('TrafficSources', () => {
  let component: TrafficSources;
  let fixture: ComponentFixture<TrafficSources>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficSources]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficSources);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
