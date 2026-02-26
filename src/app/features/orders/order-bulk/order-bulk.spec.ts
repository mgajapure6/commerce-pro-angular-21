import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBulk } from './order-bulk';

describe('OrderBulk', () => {
  let component: OrderBulk;
  let fixture: ComponentFixture<OrderBulk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderBulk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderBulk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
