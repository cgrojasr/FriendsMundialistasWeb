import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { PartidoGrupo } from '../../core/models/calendario.model';
import { CalendarioService } from '../../core/services/calendario.service';

interface PartidoVista extends PartidoGrupo {
  fase: string;
  fecha: string;
  hora: string;
}

@Component({
  selector: 'app-calendario-visualizar',
  imports: [],
  templateUrl: './calendario-visualizar.html',
  styleUrl: './calendario-visualizar.css',
})
export class CalendarioVisualizar {
  private readonly calendarioService = inject(CalendarioService);

  readonly cargando = signal(false);
  readonly mensajeError = signal('');
  readonly partidos = signal<PartidoGrupo[]>([]);
  readonly ultimaActualizacion = signal('');

  readonly partidosVista = computed(() =>
    [...this.partidos()]
      .sort((a, b) => a.fechaHoraIso.localeCompare(b.fechaHoraIso))
      .map((partido) => this.aPartidoVista(partido))
  );

  constructor() {
    timer(0, 3000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cargarCalendario());
  }

  private cargarCalendario(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.calendarioService.getPartidos().subscribe({
      next: (response) => {
        this.partidos.set(response.data);
        this.ultimaActualizacion.set(new Date().toLocaleTimeString('es-CL'));
        this.cargando.set(false);
      },
      error: () => {
        this.mensajeError.set('No se pudo obtener el calendario de partidos.');
        this.cargando.set(false);
      },
    });
  }

  private aPartidoVista(partido: PartidoGrupo): PartidoVista {
    const fechaHora = new Date(partido.fechaHoraIso);
    return {
      ...partido,
      fase: 'Fase de Grupos',
      fecha: fechaHora.toLocaleDateString('es-CL', { dateStyle: 'medium' }),
      hora: fechaHora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
