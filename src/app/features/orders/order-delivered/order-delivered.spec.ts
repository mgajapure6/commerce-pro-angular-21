import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDelivered } from './order-delivered';

describe('OrderDelivered', () => {
  let component: OrderDelivered;
  let fixture: ComponentFixture<OrderDelivered>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDelivered]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDelivered);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
