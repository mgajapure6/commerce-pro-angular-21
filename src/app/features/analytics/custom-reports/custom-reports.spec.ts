import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomReports } from './custom-reports';

describe('CustomReports', () => {
  let component: CustomReports;
  let fixture: ComponentFixture<CustomReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
