import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PronosticoRegistrar } from './pronostico-registrar';

describe('PronosticoRegistrar', () => {
  let component: PronosticoRegistrar;
  let fixture: ComponentFixture<PronosticoRegistrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PronosticoRegistrar],
    }).compileComponents();

    fixture = TestBed.createComponent(PronosticoRegistrar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
