import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderReturn } from './order-return';

describe('OrderReturn', () => {
  let component: OrderReturn;
  let fixture: ComponentFixture<OrderReturn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderReturn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderReturn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
