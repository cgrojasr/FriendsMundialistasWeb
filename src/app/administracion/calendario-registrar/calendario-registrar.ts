import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartidoGrupo } from '../../core/models/calendario.model';
import { Equipo } from '../../core/models/equipo.model';
import { CalendarioService } from '../../core/services/calendario.service';
import { EquipoService } from '../../core/services/equipo.service';

@Component({
  selector: 'app-calendario-registrar',
  imports: [FormsModule],
  templateUrl: './calendario-registrar.html',
  styleUrl: './calendario-registrar.css',
})
export class CalendarioRegistrar {
  private readonly equipoService = inject(EquipoService);
  private readonly calendarioService = inject(CalendarioService);

  readonly GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  readonly MAX_PARTIDOS_POR_EQUIPO = 3;

  readonly cargando = signal(false);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');
  readonly equipos = signal<Equipo[]>([]);
  readonly partidos = signal<PartidoGrupo[]>([]);

  equipoLocalId = '';
  equipoVisitanteId = '';
  fechaPartido = '';
  horaPartido = '';

  readonly equiposConGrupo = computed(() =>
    this.equipos()
      .filter((equipo) => !!equipo.idGrupo && this.GRUPOS.includes(equipo.idGrupo.toUpperCase()))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
  );

  readonly partidosOrdenados = computed(() =>
    [...this.partidos()].sort((a, b) => a.fechaHoraIso.localeCompare(b.fechaHoraIso))
  );

  constructor() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.equipoService.getAll().subscribe({
      next: (equiposResponse) => {
        this.equipos.set(equiposResponse.data);

        this.calendarioService.getPartidos().subscribe({
          next: (partidosResponse) => {
            this.partidos.set(partidosResponse.data);
            this.cargando.set(false);
          },
          error: () => {
            this.cargando.set(false);
            this.mensajeError.set('No se pudo obtener el calendario de partidos.');
          },
        });
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudieron cargar los equipos registrados.');
      },
    });
  }

  registrarPartido(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    const equipoLocal = this.buscarEquipo(Number(this.equipoLocalId));
    const equipoVisitante = this.buscarEquipo(Number(this.equipoVisitanteId));

    if (!equipoLocal || !equipoVisitante) {
      this.mensajeError.set('Debes seleccionar ambos equipos.');
      return;
    }

    if (equipoLocal.idEquipo === equipoVisitante.idEquipo) {
      this.mensajeError.set('No se puede registrar un partido del equipo contra sí mismo.');
      return;
    }

    if (
      !equipoLocal.idGrupo ||
      !equipoVisitante.idGrupo ||
      equipoLocal.idGrupo !== equipoVisitante.idGrupo
    ) {
      this.mensajeError.set('Solo se permiten partidos entre equipos del mismo grupo.');
      return;
    }

    if (!this.fechaPartido || !this.horaPartido) {
      this.mensajeError.set('La fecha y hora son obligatorias.');
      return;
    }

    const fechaHoraIso = `${this.fechaPartido}T${this.horaPartido}:00`;
    const fechaHora = new Date(fechaHoraIso);

    // if (Number.isNaN(fechaHora.getTime()) || fechaHora <= new Date()) {
    //   this.mensajeError.set('La fecha y hora no son válidas o están en el pasado.');
    //   return;
    // }

    const yaExiste = this.partidos().some((partido) => {
      const mismoGrupo = partido.idGrupo === equipoLocal.idGrupo;
      const mismoEnfrentamiento =
        (partido.equipoLocalId === equipoLocal.idEquipo && partido.equipoVisitanteId === equipoVisitante.idEquipo) ||
        (partido.equipoLocalId === equipoVisitante.idEquipo && partido.equipoVisitanteId === equipoLocal.idEquipo);
      return mismoGrupo && mismoEnfrentamiento;
    });

    if (yaExiste) {
      this.mensajeError.set('El partido ya existe para este enfrentamiento.');
      return;
    }

    const partidosLocal = this.contarPartidosEquipo(equipoLocal.idEquipo);
    const partidosVisitante = this.contarPartidosEquipo(equipoVisitante.idEquipo);

    if (partidosLocal >= this.MAX_PARTIDOS_POR_EQUIPO || partidosVisitante >= this.MAX_PARTIDOS_POR_EQUIPO) {
      this.mensajeError.set('Uno de los equipos ya completó sus 3 partidos de fase de grupos.');
      return;
    }

    this.cargando.set(true);
    this.calendarioService
      .registrarPartido({
        idGrupo: equipoLocal.idGrupo,
        equipoLocalId: equipoLocal.idEquipo,
        equipoLocalNombre: equipoLocal.nombre,
        equipoVisitanteId: equipoVisitante.idEquipo,
        equipoVisitanteNombre: equipoVisitante.nombre,
        fechaHoraIso,
      })
      .subscribe({
        next: (response) => {
          this.partidos.set([...this.partidos(), response.data]);
          this.mensajeExito.set(response.mensaje);
          this.cargando.set(false);
          this.limpiarFormulario();
        },
        error: () => {
          this.cargando.set(false);
          this.mensajeError.set('No se pudo registrar el partido.');
        },
      });
  }

  limpiarMensajes(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  formatearFechaHora(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  etiquetaEquipo(equipo: Equipo): string {
    return `${equipo.nombre} (Grupo ${equipo.idGrupo})`;
  }

  private buscarEquipo(id: number): Equipo | undefined {
    return this.equiposConGrupo().find((equipo) => equipo.idEquipo === id);
  }

  private contarPartidosEquipo(idEquipo: number): number {
    return this.partidos().filter(
      (partido) => partido.equipoLocalId === idEquipo || partido.equipoVisitanteId === idEquipo
    ).length;
  }

  private limpiarFormulario(): void {
    this.equipoLocalId = '';
    this.equipoVisitanteId = '';
    this.fechaPartido = '';
    this.horaPartido = '';
  }
}
