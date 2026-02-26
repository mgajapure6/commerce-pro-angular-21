import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Valuation } from './valuation';

describe('Valuation', () => {
  let component: Valuation;
  let fixture: ComponentFixture<Valuation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Valuation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Valuation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
