import { Component, input } from '@angular/core';
import { GrupoComposicion } from '../../core/models/equipo.model';

@Component({
  selector: 'app-equipo-asignar-grupo-tabla',
  imports: [],
  templateUrl: './equipo-asignar-grupo-tabla.html',
  styleUrl: './equipo-asignar-grupo-tabla.css',
})
export class EquipoAsignarGrupoTabla {
  readonly composicion = input<GrupoComposicion[]>([]);
  readonly maxEquiposPorGrupo = input<number>(4);
}
