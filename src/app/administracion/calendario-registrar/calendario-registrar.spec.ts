import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioRegistrar } from './calendario-registrar';

describe('CalendarioRegistrar', () => {
  let component: CalendarioRegistrar;
  let fixture: ComponentFixture<CalendarioRegistrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioRegistrar],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarioRegistrar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
