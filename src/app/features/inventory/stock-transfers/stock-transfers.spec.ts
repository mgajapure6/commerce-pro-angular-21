import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTransfers } from './stock-transfers';

describe('Transfers', () => {
  let component: StockTransfers;
  let fixture: ComponentFixture<StockTransfers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTransfers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockTransfers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
