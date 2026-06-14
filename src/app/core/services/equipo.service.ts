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

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/equipos';

  getAll(): Observable<ApiResponse<Equipo[]>> {
    return this.http.get<ApiResponse<Equipo[]>>(this.baseUrl);
  }

  registrar(request: EquipoRegistrarRequest): Observable<ApiResponse<Equipo>> {
    return of({ data: { id: Date.now(), nombre: request.nombre, grupo: request.grupo }, mensaje: 'Equipo registrado exitosamente.', exitoso: true });
    // Simulación de respuesta exitosa (reemplazar con llamada real a la API)
    // return this.http.post<ApiResponse<Equipo>>(this.baseUrl, request);
  }

  asignarGrupo(equipoId: number, request: EquipoAsignarGrupoRequest): Observable<ApiResponse<Equipo>> {
    return this.http.put<ApiResponse<Equipo>>(`${this.baseUrl}/${equipoId}/grupo`, request);
  }

  getComposicionGrupos(): Observable<ApiResponse<GrupoComposicion[]>> {
    return this.http.get<ApiResponse<GrupoComposicion[]>>('/api/grupos/composicion');
  }
}
