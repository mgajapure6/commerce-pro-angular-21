import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickPack } from './pick-pack';

describe('PickPack', () => {
  let component: PickPack;
  let fixture: ComponentFixture<PickPack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickPack]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickPack);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
