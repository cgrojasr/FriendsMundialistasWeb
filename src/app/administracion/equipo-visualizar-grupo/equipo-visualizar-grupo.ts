import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Equipo, GrupoComposicion } from '../../core/models/equipo.model';
import { EquipoService } from '../../core/services/equipo.service';
import { timer } from 'rxjs';

interface GrupoVisual {
  grupo: string;
  equipos: Equipo[];
  incompleto: boolean;
  completo: boolean;
}

@Component({
  selector: 'app-equipo-visualizar-grupo',
  imports: [],
  templateUrl: './equipo-visualizar-grupo.html',
  styleUrl: './equipo-visualizar-grupo.css',
})
export class EquipoVisualizarGrupo {
  private readonly equipoService = inject(EquipoService);

  readonly GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  readonly MAX_EQUIPOS_POR_GRUPO = 4;

  readonly grupos = signal<GrupoVisual[]>([]);
  readonly cargando = signal(false);
  readonly mensajeError = signal('');
  readonly duplicadosDetectados = signal<string[]>([]);
  readonly ultimaActualizacion = signal('');

  readonly totalEquiposAsignados = computed(() =>
    this.grupos().reduce((acc, grupo) => acc + grupo.equipos.length, 0)
  );

  constructor() {
    timer(0, 3000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cargarComposicion());
  }

  private cargarComposicion(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.equipoService.getComposicionGrupos().subscribe({
      next: (response) => {
        const normalizado = this.normalizarGrupos(response.data);
        this.grupos.set(normalizado.grupos);
        this.duplicadosDetectados.set(normalizado.duplicados);
        this.ultimaActualizacion.set(new Date().toLocaleTimeString());
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo obtener la composición de grupos.');
      },
    });
  }

  private normalizarGrupos(origen: GrupoComposicion[]): { grupos: GrupoVisual[]; duplicados: string[] } {
    const gruposMap = new Map<string, Equipo[]>();
    for (const grupo of this.GRUPOS) {
      gruposMap.set(grupo, []);
    }

    const equipoIds = new Set<number>();
    const duplicados = new Set<string>();

    for (const item of origen) {
      const grupo = item.grupo?.trim().toUpperCase();
      if (!grupo || !gruposMap.has(grupo)) {
        continue;
      }

      for (const equipo of item.equipos) {
        if (equipoIds.has(equipo.idEquipo)) {
          duplicados.add(equipo.nombre);
          continue;
        }
        equipoIds.add(equipo.idEquipo);
        gruposMap.get(grupo)?.push(equipo);
      }
    }

    const grupos: GrupoVisual[] = this.GRUPOS.map((grupo) => {
      const equiposOrdenados = [...(gruposMap.get(grupo) || [])].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );

      return {
        grupo,
        equipos: equiposOrdenados,
        incompleto: equiposOrdenados.length < this.MAX_EQUIPOS_POR_GRUPO,
        completo: equiposOrdenados.length === this.MAX_EQUIPOS_POR_GRUPO,
      };
    });

    return { grupos, duplicados: Array.from(duplicados).sort() };
  }
}
