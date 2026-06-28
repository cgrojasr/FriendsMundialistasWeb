import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { PartidoGrupo } from '../../core/models/calendario.model';
import { CalendarioService } from '../../core/services/calendario.service';

interface PartidoResultadoVista {
  id: number;
  grupo: string;
  fase: string;
  equipoLocalNombre: string;
  equipoVisitanteNombre: string;
  fecha: string;
  hora: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  tieneResultado: boolean;
}

interface PartidoOrdenado extends PartidoGrupo {
  fase: string;
  fecha: string;
  hora: string;
}

@Component({
  selector: 'app-calendario-resultado',
  imports: [FormsModule],
  templateUrl: './calendario-resultado.html',
  styleUrl: './calendario-resultado.css',
})
export class CalendarioResultado {
  private readonly calendarioService = inject(CalendarioService);

  readonly cargando = signal(false);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');
  readonly partidos = signal<PartidoGrupo[]>([]);
  readonly ultimaActualizacion = signal('');
  readonly modoEdicion = signal(false);
  readonly confirmarActualizacion = signal(false);

  partidoIdSeleccionado = '';
  golesLocal = '';
  golesVisitante = '';

  readonly partidosOrdenados = computed(() =>
    [...this.partidos()]
      .sort((a, b) => a.fechaHoraIso.localeCompare(b.fechaHoraIso))
      .map((partido) => this.aPartidoOrdenado(partido))
  );

  readonly partidoSeleccionado = computed(() =>
    this.partidos().find((partido) => partido.id === Number(this.partidoIdSeleccionado))
  );

  readonly resultadoYaRegistrado = computed(() => !!this.partidoSeleccionado()?.resultadoOficial);

  readonly partidosVista = computed<PartidoResultadoVista[]>(() =>
    this.partidosOrdenados().map((partido) => ({
      id: partido.id,
      grupo: partido.idGrupo,
      fase: partido.fase,
      equipoLocalNombre: partido.equipoLocalNombre,
      equipoVisitanteNombre: partido.equipoVisitanteNombre,
      fecha: partido.fecha,
      hora: partido.hora,
      golesLocal: partido.resultadoOficial?.golesLocal ?? null,
      golesVisitante: partido.resultadoOficial?.golesVisitante ?? null,
      tieneResultado: !!partido.resultadoOficial,
    }))
  );

  constructor() {
    timer(0, 3000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cargarCalendario());
  }

  seleccionarPartido(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.modoEdicion.set(false);
    this.confirmarActualizacion.set(false);

    const partido = this.partidoSeleccionado();
    if (!partido) {
      this.golesLocal = '';
      this.golesVisitante = '';
      return;
    }

    if (partido.resultadoOficial) {
      this.golesLocal = String(partido.resultadoOficial.golesLocal);
      this.golesVisitante = String(partido.resultadoOficial.golesVisitante);
    } else {
      this.golesLocal = '';
      this.golesVisitante = '';
    }
  }

  habilitarEdicion(): void {
    if (!this.resultadoYaRegistrado()) {
      return;
    }
    this.modoEdicion.set(true);
    this.confirmarActualizacion.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  guardarResultado(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    const partido = this.partidoSeleccionado();
    if (!partido) {
      this.mensajeError.set('Debes seleccionar un partido.');
      return;
    }

    if (this.golesLocal === '' || this.golesVisitante === '') {
      this.mensajeError.set('Los goles son obligatorios para ambos equipos.');
      return;
    }

    const golesLocalNum = Number(this.golesLocal);
    const golesVisitanteNum = Number(this.golesVisitante);

    if (
      !Number.isInteger(golesLocalNum) ||
      !Number.isInteger(golesVisitanteNum) ||
      golesLocalNum < 0 ||
      golesVisitanteNum < 0
    ) {
      this.mensajeError.set(
        'Los goles deben ser números enteros iguales o mayores a cero.'
      );
      return;
    }

    this.cargando.set(true);

    if (this.resultadoYaRegistrado() && !this.modoEdicion()) {
      this.cargando.set(false);
      this.mensajeError.set('El resultado ya fue registrado para este partido.');
      return;
    }

    if (this.resultadoYaRegistrado() && this.modoEdicion()) {
      this.calendarioService
        .actualizarResultado({
          partidoId: partido.id,
          golesLocal: golesLocalNum,
          golesVisitante: golesVisitanteNum,
          confirmarActualizacion: this.confirmarActualizacion(),
        })
        .subscribe({
          next: (response) => {
            if (!response.exitoso) {
              this.mensajeError.set(response.mensaje);
              this.cargando.set(false);
              return;
            }
            this.actualizarPartido(response.data.partido);
            this.mensajeExito.set(
              `${response.mensaje} Usuarios recalculados: ${response.data.usuariosRecalculados}.`
            );
            this.modoEdicion.set(false);
            this.confirmarActualizacion.set(false);
            this.cargando.set(false);
          },
          error: () => {
            this.mensajeError.set('No se pudo actualizar el resultado.');
            this.cargando.set(false);
          },
        });
      return;
    }

    this.calendarioService
      .registrarResultado({
        partidoId: partido.id,
        golesLocal: golesLocalNum,
        golesVisitante: golesVisitanteNum,
      })
      .subscribe({
        next: (response) => {
          if (!response.exitoso) {
            this.mensajeError.set(response.mensaje);
            this.cargando.set(false);
            return;
          }
          this.actualizarPartido(response.data.partido);
          this.mensajeExito.set(
            `${response.mensaje} Usuarios recalculados: ${response.data.usuariosRecalculados}.`
          );
          this.cargando.set(false);
        },
        error: () => {
          this.mensajeError.set('No se pudo registrar el resultado.');
          this.cargando.set(false);
        },
      });
  }

  private cargarCalendario(): void {
    if (this.partidos().length === 0) {
      this.cargando.set(true);
    }

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

  private aPartidoOrdenado(partido: PartidoGrupo): PartidoOrdenado {
    const fechaHora = new Date(partido.fechaHoraIso);
    return {
      ...partido,
      fase: partido.fase || 'Fase de Grupos',
      fecha: fechaHora.toLocaleDateString('es-CL', { dateStyle: 'medium' }),
      hora: fechaHora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  private actualizarPartido(partidoActualizado: PartidoGrupo): void {
    this.partidos.set(
      this.partidos().map((partido) =>
        partido.id === partidoActualizado.id ? partidoActualizado : partido
      )
    );
  }
}
