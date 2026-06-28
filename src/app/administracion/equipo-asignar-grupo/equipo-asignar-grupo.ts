import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Equipo, GrupoComposicion } from '../../core/models/equipo.model';
import { EquipoService } from '../../core/services/equipo.service';
import { EquipoAsignarGrupoTabla } from '../equipo-asignar-grupo-tabla/equipo-asignar-grupo-tabla';

@Component({
  selector: 'app-equipo-asignar-grupo',
  imports: [FormsModule, EquipoAsignarGrupoTabla],
  templateUrl: './equipo-asignar-grupo.html',
  styleUrl: './equipo-asignar-grupo.css',
})
export class EquipoAsignarGrupo {
  private readonly equipoService = inject(EquipoService);

  readonly GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  readonly MAX_EQUIPOS_POR_GRUPO = 4;

  readonly equipos = signal<Equipo[]>([]);
  readonly composicion = signal<GrupoComposicion[]>([]);
  readonly cargando = signal(false);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');

  selectedEquipoId = '';
  selectedGrupo = '';

  readonly equiposDisponibles = computed(() => this.equipos());

  constructor() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.equipoService.getAll().subscribe({
      next: (res) => {
        this.equipos.set(res.data);
        this.cargarComposicion();
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudieron cargar los equipos registrados.');
      },
    });
  }

  cargarComposicion(): void {
    this.equipoService.getComposicionGrupos().subscribe({
      next: (res) => {
        this.composicion.set(res.data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo obtener la composición de grupos.');
      },
    });
  }

  asignarEquipoAGrupo(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    if (!this.selectedEquipoId) {
      this.mensajeError.set('Debes seleccionar un equipo.');
      return;
    }

    if (!this.selectedGrupo) {
      this.mensajeError.set('Debes seleccionar un grupo válido.');
      return;
    }

    this.cargando.set(true);
    //validar que el grupo no tenga más de 4 equipos asignados
    const grupoActual = this.composicion().find(g => g.grupo === this.selectedGrupo);
    if (grupoActual && grupoActual.equipos.length >= this.MAX_EQUIPOS_POR_GRUPO) {
      this.cargando.set(false);
      this.mensajeError.set(`El grupo ${this.selectedGrupo} ya tiene el máximo de ${this.MAX_EQUIPOS_POR_GRUPO} equipos asignados.`);
      return;
    }
    this.equipoService
      .asignarGrupo(Number(this.selectedEquipoId), { idGrupo: this.selectedGrupo })
      .subscribe({
        next: (res) => {
          const actualizados = this.equipos().map(e => (e.idEquipo === res.data.idEquipo ? res.data : e));
          this.equipos.set(actualizados);
          this.mensajeExito.set(res.mensaje);
          this.cargarComposicion();
        },
        error: (err) => {
          this.cargando.set(false);
          this.mensajeError.set(
            err?.error?.mensaje ||
              err?.error?.body?.mensaje ||
              'No se pudo completar la asignación del equipo.'
          );
        },
      });
  }

  limpiarMensajes(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  getEquipoNombre(equipo: Equipo): string {
    return equipo.idGrupo ? `${equipo.nombre} (Grupo ${equipo.idGrupo})` : `${equipo.nombre} (Sin grupo)`;
  }

  mostrarGrupo(grupo: string) {
    console.log(`Grupo seleccionado: ${grupo}`)
  }
}
