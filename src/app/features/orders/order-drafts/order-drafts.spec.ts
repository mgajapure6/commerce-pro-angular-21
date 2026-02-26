import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDrafts } from './order-drafts';

describe('OrderDrafts', () => {
  let component: OrderDrafts;
  let fixture: ComponentFixture<OrderDrafts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDrafts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDrafts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
