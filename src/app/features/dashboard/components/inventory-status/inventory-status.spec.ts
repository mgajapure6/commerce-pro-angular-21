import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryStatus } from './inventory-status';

describe('InventoryStatus', () => {
  let component: InventoryStatus;
  let fixture: ComponentFixture<InventoryStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
