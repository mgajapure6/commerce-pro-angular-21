import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRefund } from './order-refund';

describe('OrderRefund', () => {
  let component: OrderRefund;
  let fixture: ComponentFixture<OrderRefund>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderRefund]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderRefund);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
