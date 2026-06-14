import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Equipo } from '../../core/models/equipo.model';
import { EquipoService } from '../../core/services/equipo.service';

@Component({
  selector: 'app-equipo-registrar',
  imports: [FormsModule],
  templateUrl: './equipo-registrar.html',
  styleUrl: './equipo-registrar.css',
})
export class EquipoRegistrar implements OnInit {
  private readonly equipoService = inject(EquipoService);

  readonly MAX_EQUIPOS = 48;
  readonly GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  equipos: Equipo[] = [];
  nuevoNombre = '';
  nuevoGrupo = '';
  mensajeExito = '';
  mensajeError = '';
  cargando = false;

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.cargando = true;
    this.equipoService.getAll().subscribe({
      next: (res) => {
        this.equipos = res.data;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo obtener la lista de equipos.';
        this.cargando = false;
      },
    });
  }

  registrar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cargando = true;

    this.equipoService
      .registrar({ nombre: this.nuevoNombre.trim(), grupo: this.nuevoGrupo || undefined })
      .subscribe({
        next: (res) => {
          this.cargando = false;
          if (res.exitoso) {
            this.equipos = [...this.equipos, res.data];
            this.mensajeExito = res.mensaje;
            this.nuevoNombre = '';
            this.nuevoGrupo = '';
          } else {
            this.mensajeError = res.mensaje;
          }
        },
        error: () => {
          this.cargando = false;
          this.mensajeError = 'Error de comunicación con el servidor.';
        },
      });
  }

  limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }
}
