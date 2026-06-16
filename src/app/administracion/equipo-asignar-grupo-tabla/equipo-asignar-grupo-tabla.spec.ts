import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoAsignarGrupoTabla } from './equipo-asignar-grupo-tabla';

describe('EquipoAsignarGrupoTabla', () => {
  let component: EquipoAsignarGrupoTabla;
  let fixture: ComponentFixture<EquipoAsignarGrupoTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoAsignarGrupoTabla],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipoAsignarGrupoTabla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
