import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoRegistrar } from './equipo-registrar';

describe('EquipoRegistrar', () => {
  let component: EquipoRegistrar;
  let fixture: ComponentFixture<EquipoRegistrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoRegistrar],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipoRegistrar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
