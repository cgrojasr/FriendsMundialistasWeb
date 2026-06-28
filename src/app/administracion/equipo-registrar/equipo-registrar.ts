import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Equipo } from '../../core/models/equipo.model';
import { EquipoService } from '../../core/services/equipo.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-equipo-registrar',
  imports: [FormsModule],
  templateUrl: './equipo-registrar.html',
  styleUrl: './equipo-registrar.css',
})
export class EquipoRegistrar implements OnInit {
  private readonly equipoService = inject(EquipoService);
  private readonly cookieService = inject(CookieService);

  readonly MAX_EQUIPOS = 48;
  readonly GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  equipos: Equipo[] = [];
  nuevoNombre = '';
  nuevoGrupo = '';
  mensajeExito = '';
  mensajeError = '';
  cargando = false;

  ngOnInit(): void {
    // Inicializar la cookie de equipos. Si existe, cargar su valor; si no, crearla vacía.
    // Tiempo de vida de la cookie: 30 minutos (puede ajustarse según necesidades)
    if (!this.cookieService.check('equipos')) {
      this.cookieService.set('equipos', JSON.stringify([]), 30); // 30 minutos
    } else {
        try {
          this.cargarEquipos();
        } catch {
          this.equipos = [];
          this.cookieService.set('equipos', JSON.stringify([]), 30); // Reiniciar cookie si el valor no es un JSON válido
        }
    }
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
      .registrar({ nombre: this.nuevoNombre.trim(), idGrupo: this.nuevoGrupo || undefined })
      .subscribe({
        next: (res) => {
          this.cargando = false;
          if (res.exitoso) {
            this.equipos = [...this.equipos, res.data];
            // Actualizar la cookie con el nuevo equipo registrado
            this.cookieService.set('equipos', JSON.stringify(this.equipos));
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
