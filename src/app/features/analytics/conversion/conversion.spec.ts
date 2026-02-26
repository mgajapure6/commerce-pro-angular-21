import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Conversion } from './conversion';

describe('Conversion', () => {
  let component: Conversion;
  let fixture: ComponentFixture<Conversion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conversion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Conversion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
