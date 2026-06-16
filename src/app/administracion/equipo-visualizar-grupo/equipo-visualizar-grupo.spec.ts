import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoVisualizarGrupo } from './equipo-visualizar-grupo';

describe('EquipoVisualizarGrupo', () => {
  let component: EquipoVisualizarGrupo;
  let fixture: ComponentFixture<EquipoVisualizarGrupo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoVisualizarGrupo],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipoVisualizarGrupo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
