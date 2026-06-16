import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioVisualizar } from './calendario-visualizar';

describe('CalendarioVisualizar', () => {
  let component: CalendarioVisualizar;
  let fixture: ComponentFixture<CalendarioVisualizar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioVisualizar],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarioVisualizar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
