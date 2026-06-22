import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../core/services/autenticacion.service';
import { PronosticoService } from '../../core/services/pronostico.service';
import { PartidoGrupo } from '../../core/models/calendario.model';

@Component({
  selector: 'app-pronostico-registrar',
  imports: [FormsModule],
  templateUrl: './pronostico-registrar.html',
  styleUrl: './pronostico-registrar.css',
})
export class PronosticoRegistrar {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly pronosticoService = inject(PronosticoService);

  readonly autenticado = signal(this.autenticacionService.estaAutenticado());
  readonly cargando = signal(false);
  readonly partidosDisponibles = signal<PartidoGrupo[]>([]);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');

  readonly partidoSeleccionado = computed(() => {
    return this.partidosDisponibles().find((partido) => partido.id === this.partidoId) ?? null;
  });

  partidoId: number | null = null;
  golesLocal = '';
  golesVisitante = '';

  constructor() {
    if (this.autenticado()) {
      this.cargarPartidosDisponibles();
    }
  }

  registrarPronostico(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');

    if (!this.autenticado()) {
      this.mensajeError.set('Debes estar autenticado para registrar pronósticos.');
      return;
    }

    const usuarioId = this.autenticacionService.obtenerUsuarioAutenticadoId();
    if (usuarioId === null) {
      this.mensajeError.set('No se encontró una sesión válida. Vuelve a autenticarte.');
      return;
    }

    if (this.partidoId === null) {
      this.mensajeError.set('Debes seleccionar un partido disponible.');
      return;
    }

    if (this.golesLocal.trim() === '' || this.golesVisitante.trim() === '') {
      this.mensajeError.set('Los goles son obligatorios.');
      return;
    }

    const golesLocalNumber = Number(this.golesLocal);
    const golesVisitanteNumber = Number(this.golesVisitante);

    if (
      !Number.isInteger(golesLocalNumber) ||
      !Number.isInteger(golesVisitanteNumber) ||
      golesLocalNumber < 0 ||
      golesVisitanteNumber < 0
    ) {
      this.mensajeError.set('Los goles deben ser números enteros iguales o mayores a cero.');
      return;
    }

    this.cargando.set(true);
    this.pronosticoService
      .registrarPronostico({
        usuarioId,
        partidoId: this.partidoId,
        golesLocal: golesLocalNumber,
        golesVisitante: golesVisitanteNumber,
      })
      .subscribe({
        next: (response) => {
          this.cargando.set(false);

          if (!response.exitoso) {
            this.mensajeError.set(response.mensaje);
            this.cargarPartidosDisponibles();
            return;
          }

          this.mensajeExito.set('Pronóstico registrado correctamente.');
          this.partidoId = null;
          this.golesLocal = '';
          this.golesVisitante = '';
          this.cargarPartidosDisponibles();
        },
        error: () => {
          this.cargando.set(false);
          this.mensajeError.set('No se pudo registrar el pronóstico.');
        },
      });
  }

  limpiarMensajes(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    this.autenticado.set(false);
    this.partidosDisponibles.set([]);
    this.partidoId = null;
    this.golesLocal = '';
    this.golesVisitante = '';
    this.mensajeExito.set('');
    this.mensajeError.set('Sesión cerrada correctamente.');
  }

  formatFechaHora(fechaHoraIso: string): string {
    const fecha = new Date(fechaHoraIso);

    if (Number.isNaN(fecha.getTime())) {
      return fechaHoraIso;
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(fecha);
  }

  private cargarPartidosDisponibles(): void {
    this.pronosticoService.getPartidosDisponibles().subscribe({
      next: (response) => {
        if (!response.exitoso) {
          this.partidosDisponibles.set([]);
          this.mensajeError.set(response.mensaje);
          return;
        }

        this.partidosDisponibles.set(response.data);
      },
      error: () => {
        this.partidosDisponibles.set([]);
        this.mensajeError.set('No se pudo cargar la lista de partidos disponibles.');
      },
    });
  }
}
