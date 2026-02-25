import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPending } from './order-pending';

describe('OrderPending', () => {
  let component: OrderPending;
  let fixture: ComponentFixture<OrderPending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPending]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPending);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
