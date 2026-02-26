import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Traffic } from './traffic';

describe('Traffic', () => {
  let component: Traffic;
  let fixture: ComponentFixture<Traffic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Traffic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Traffic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
