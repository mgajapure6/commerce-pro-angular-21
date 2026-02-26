import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dropship } from './dropship';

describe('Dropship', () => {
  let component: Dropship;
  let fixture: ComponentFixture<Dropship>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dropship]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dropship);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
