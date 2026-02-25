import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderProcessing } from './order-processing';

describe('OrderProcessing', () => {
  let component: OrderProcessing;
  let fixture: ComponentFixture<OrderProcessing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderProcessing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderProcessing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
