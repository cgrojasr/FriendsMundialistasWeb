import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoAsignarGrupo } from './equipo-asignar-grupo';

describe('EquipoAsignarGrupo', () => {
  let component: EquipoAsignarGrupo;
  let fixture: ComponentFixture<EquipoAsignarGrupo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoAsignarGrupo],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipoAsignarGrupo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
