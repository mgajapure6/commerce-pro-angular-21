import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOverview } from './inventory-overview';

describe('InventoryOverview', () => {
  let component: InventoryOverview;
  let fixture: ComponentFixture<InventoryOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
