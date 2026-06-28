import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ApiResponse,
  Equipo,
  EquipoAsignarGrupoRequest,
  EquipoRegistrarRequest,
  GrupoComposicion,
} from '../models/equipo.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private readonly cookieService = inject(CookieService);

  getAll(): Observable<ApiResponse<Equipo[]>> {
    // Simular respuesta desde la cookie (reemplazar con llamada real a la API)
    const equipos: Equipo[] = this.cookieService.check('equipos')
      ? JSON.parse(this.cookieService.get('equipos'))
      : [];
    return of({ data: equipos, mensaje: 'Equipos obtenidos exitosamente.', exitoso: true });
    // return of({ data: [], mensaje: 'Equipos obtenidos exitosamente.', exitoso: true }); // Simulación de respuesta vacía
    // return this.http.get<ApiResponse<Equipo[]>>(this.baseUrl);
  }

  registrar(request: EquipoRegistrarRequest): Observable<ApiResponse<Equipo>> {
    const nombre = request.nombre?.trim();
    if (!nombre) {
      return of({ data: null!, mensaje: 'El nombre del equipo es obligatorio.', exitoso: false });
    }

    const equipos: Equipo[] = this.cookieService.check('equipos')
      ? JSON.parse(this.cookieService.get('equipos'))
      : [];

    const existe = equipos.some((equipo) => equipo.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      return of({ data: null!, mensaje: `El equipo "${nombre}" ya existe.`, exitoso: false });
    }

    if (equipos.length >= 48) {
      return of({ data: null!, mensaje: 'Se alcanzó el máximo de 48 equipos.', exitoso: false });
    }

    const nextId = equipos.length > 0 ? Math.max(...equipos.map((equipo) => equipo.idEquipo)) + 1 : 1;
    const nuevoEquipo: Equipo = {
      idEquipo: nextId,
      nombre,
      idGrupo: request.idGrupo,
      fechaCreacion: new Date().toISOString(),
    };

    const actualizados = [...equipos, nuevoEquipo];
    this.cookieService.set('equipos', JSON.stringify(actualizados));

    return of({ data: nuevoEquipo, mensaje: 'Equipo registrado exitosamente.', exitoso: true });
  }

  asignarGrupo(equipoId: number, request: EquipoAsignarGrupoRequest): Observable<ApiResponse<Equipo>> {
    // Simulación de respuesta exitosa (reemplazar con llamada real a la API)
    let equipoAsignado: Equipo | null = null;
    if (this.cookieService.check('equipos')) {
      const equipos: Equipo[] = JSON.parse(this.cookieService.get('equipos'));
      const equipoIndex = equipos.findIndex((e) => e.idEquipo === equipoId);
      if (equipoIndex !== -1) {
        equipos[equipoIndex].idGrupo = request.idGrupo;
        equipoAsignado = equipos[equipoIndex];
        this.cookieService.set('equipos', JSON.stringify(equipos));
      }
    }
    return of({ data: equipoAsignado!, mensaje: 'Equipo asignado al grupo exitosamente.', exitoso: true });
    // return of({ data: null!, mensaje: 'Equipo no encontrado.', exitoso: false }); // Simulación de respuesta de error
    // return this.http.put<ApiResponse<Equipo>>(`${this.baseUrl}/${equipoId}/grupo`, request);
  }

  getComposicionGrupos(): Observable<ApiResponse<GrupoComposicion[]>> {
    let gruposComposicion: GrupoComposicion[] = [];
    if (this.cookieService.check('equipos')) {
      const equipos: Equipo[] = JSON.parse(this.cookieService.get('equipos'));
      const gruposMap: { [key: string]: Equipo[] } = {};
      equipos.forEach((equipo) => {
        const idGrupo = equipo.idGrupo || 'Sin Grupo';
        if (!gruposMap[idGrupo]) {
          gruposMap[idGrupo] = [];
        }
        gruposMap[idGrupo].push(equipo);
      });
      gruposComposicion = Object.keys(gruposMap).map((idGrupo) => ({
        grupo: idGrupo,
        equipos: gruposMap[idGrupo],
      }));
    }
    return of({ data: gruposComposicion, mensaje: 'Composición de grupos obtenida exitosamente.', exitoso: true });
    // Simulación de respuesta (reemplazar con llamada real a la API)
    //
    // return this.http.get<ApiResponse<GrupoComposicion[]>>(environment.apiRoutes.gruposComposicion);
  }
}
