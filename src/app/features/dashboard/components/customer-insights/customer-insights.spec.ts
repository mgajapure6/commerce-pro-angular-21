import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInsights } from './customer-insights';

describe('CustomerInsights', () => {
  let component: CustomerInsights;
  let fixture: ComponentFixture<CustomerInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInsights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInsights);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
