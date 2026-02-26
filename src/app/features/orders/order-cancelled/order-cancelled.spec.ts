import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCancelled } from './order-cancelled';

describe('OrderCancelled', () => {
  let component: OrderCancelled;
  let fixture: ComponentFixture<OrderCancelled>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCancelled]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderCancelled);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
