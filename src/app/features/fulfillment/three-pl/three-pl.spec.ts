import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreePL } from './three-pl';

describe('ThreePL', () => {
  let component: ThreePL;
  let fixture: ComponentFixture<ThreePL>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreePL]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreePL);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
