import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioResultado } from './calendario-resultado';

describe('CalendarioResultado', () => {
  let component: CalendarioResultado;
  let fixture: ComponentFixture<CalendarioResultado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioResultado],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarioResultado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
