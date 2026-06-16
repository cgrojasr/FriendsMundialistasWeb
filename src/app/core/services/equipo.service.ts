import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly baseUrl = '/api/equipos';

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
    return of({ data: { id: Date.now(), nombre: request.nombre, grupo: request.grupo }, mensaje: 'Equipo registrado exitosamente.', exitoso: true });
    // Simulación de respuesta exitosa (reemplazar con llamada real a la API)
    // return this.http.post<ApiResponse<Equipo>>(this.baseUrl, request);
  }

  asignarGrupo(equipoId: number, request: EquipoAsignarGrupoRequest): Observable<ApiResponse<Equipo>> {
    // Simulación de respuesta exitosa (reemplazar con llamada real a la API)
    let equipoAsignado: Equipo | null = null;
    if (this.cookieService.check('equipos')) {
      const equipos: Equipo[] = JSON.parse(this.cookieService.get('equipos'));
      const equipoIndex = equipos.findIndex((e) => e.id === equipoId);
      if (equipoIndex !== -1) {
        equipos[equipoIndex].grupo = request.grupo;
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
        const grupo = equipo.grupo || 'Sin Grupo';
        if (!gruposMap[grupo]) {
          gruposMap[grupo] = [];
        }
        gruposMap[grupo].push(equipo);
      });
      gruposComposicion = Object.keys(gruposMap).map((grupo) => ({
        grupo,
        equipos: gruposMap[grupo],
      }));
    }
    return of({ data: gruposComposicion, mensaje: 'Composición de grupos obtenida exitosamente.', exitoso: true });
    // Simulación de respuesta (reemplazar con llamada real a la API)
    //
    // return this.http.get<ApiResponse<GrupoComposicion[]>>('/api/grupos/composicion');
  }
}
