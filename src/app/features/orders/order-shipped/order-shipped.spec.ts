import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderShipped } from './order-shipped';

describe('OrderShipped', () => {
  let component: OrderShipped;
  let fixture: ComponentFixture<OrderShipped>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderShipped]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderShipped);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
