import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiResponse } from '../models/equipo.model';
import { AutenticacionResponse, SesionUsuario, UsuarioDni } from '../models/autenticacion.model';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly cookieService = inject(CookieService);
  private readonly usuariosKey = 'usuarios_dni';
  private readonly sesionKey = 'sesion_usuario';

  autenticarPorDni(dni: string): Observable<ApiResponse<AutenticacionResponse>> {
    const usuarios = this.obtenerUsuarios();
    const usuarioExistente = usuarios.find((usuario) => usuario.dni === dni);

    if (usuarioExistente) {
      this.guardarSesion(usuarioExistente.id);
      return of({
        data: { usuarioId: usuarioExistente.id, usuarioNuevo: false },
        mensaje: 'Acceso concedido.',
        exitoso: true,
      });
    }

    const nuevoUsuario: UsuarioDni = {
      id: Date.now(),
      dni,
      creadoEnIso: new Date().toISOString(),
    };

    usuarios.push(nuevoUsuario);
    this.cookieService.set(this.usuariosKey, JSON.stringify(usuarios));
    this.guardarSesion(nuevoUsuario.id);

    return of({
      data: { usuarioId: nuevoUsuario.id, usuarioNuevo: true },
      mensaje: 'Acceso concedido.',
      exitoso: true,
    });
  }

  estaAutenticado(): boolean {
    return this.cookieService.check(this.sesionKey);
  }

  cerrarSesion(): void {
    this.cookieService.delete(this.sesionKey);
  }

  obtenerUsuarioAutenticadoId(): number | null {
    if (!this.cookieService.check(this.sesionKey)) {
      return null;
    }

    try {
      const sesion = JSON.parse(this.cookieService.get(this.sesionKey)) as SesionUsuario;
      return Number.isInteger(sesion.usuarioId) ? sesion.usuarioId : null;
    } catch {
      return null;
    }
  }

  private guardarSesion(usuarioId: number): void {
    this.cookieService.set(
      this.sesionKey,
      JSON.stringify({ usuarioId, fechaIso: new Date().toISOString() })
    );
  }

  private obtenerUsuarios(): UsuarioDni[] {
    if (!this.cookieService.check(this.usuariosKey)) {
      return [];
    }

    return JSON.parse(this.cookieService.get(this.usuariosKey)) as UsuarioDni[];
  }
}
