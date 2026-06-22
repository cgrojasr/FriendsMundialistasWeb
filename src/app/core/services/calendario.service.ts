import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiResponse } from '../models/equipo.model';
import {
  ActualizarResultadoRequest,
  PartidoGrupo,
  PartidoGrupoRegistrarRequest,
  RegistrarResultadoRequest,
  RegistroResultadoResponse,
} from '../models/calendario.model';

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private readonly cookieService = inject(CookieService);
  private readonly key = 'partidos_grupo';

  getPartidos(): Observable<ApiResponse<PartidoGrupo[]>> {
    const partidos = this.cookieService.check(this.key)
      ? (JSON.parse(this.cookieService.get(this.key)) as PartidoGrupo[])
      : [];

    return of({
      data: partidos,
      mensaje: 'Calendario obtenido correctamente.',
      exitoso: true,
    });
  }

  registrarPartido(request: PartidoGrupoRegistrarRequest): Observable<ApiResponse<PartidoGrupo>> {
    const partidos = this.cookieService.check(this.key)
      ? (JSON.parse(this.cookieService.get(this.key)) as PartidoGrupo[])
      : [];

    const nuevoPartido: PartidoGrupo = {
      id: Date.now(),
      fase: 'Fase de Grupos',
      ...request,
    };

    partidos.push(nuevoPartido);
    this.cookieService.set(this.key, JSON.stringify(partidos));

    return of({
      data: nuevoPartido,
      mensaje: 'Partido registrado correctamente.',
      exitoso: true,
    });
  }

  registrarResultado(request: RegistrarResultadoRequest): Observable<ApiResponse<RegistroResultadoResponse>> {
    const partidos = this.obtenerPartidosDesdeCookie();
    const partidoIndex = partidos.findIndex((partido) => partido.id === request.partidoId);

    if (partidoIndex === -1) {
      return of({
        data: null as unknown as RegistroResultadoResponse,
        mensaje: 'El partido no existe.',
        exitoso: false,
      });
    }

    const partido = partidos[partidoIndex];
    if (partido.resultadoOficial) {
      return of({
        data: null as unknown as RegistroResultadoResponse,
        mensaje: 'El resultado ya fue registrado.',
        exitoso: false,
      });
    }

    partido.resultadoOficial = {
      golesLocal: request.golesLocal,
      golesVisitante: request.golesVisitante,
      fechaRegistroIso: new Date().toISOString(),
    };

    this.persistirPartidos(partidos);

    const usuariosRecalculados = this.recalcularPuntosUsuarios(partido.id);
    return of({
      data: {
        partido,
        usuariosRecalculados,
      },
      mensaje: 'Resultado oficial registrado correctamente. Se inició el cálculo de puntos.',
      exitoso: true,
    });
  }

  actualizarResultado(request: ActualizarResultadoRequest): Observable<ApiResponse<RegistroResultadoResponse>> {
    const partidos = this.obtenerPartidosDesdeCookie();
    const partidoIndex = partidos.findIndex((partido) => partido.id === request.partidoId);

    if (partidoIndex === -1) {
      return of({
        data: null as unknown as RegistroResultadoResponse,
        mensaje: 'El partido no existe.',
        exitoso: false,
      });
    }

    if (!request.confirmarActualizacion) {
      return of({
        data: null as unknown as RegistroResultadoResponse,
        mensaje: 'Debes confirmar la actualización manual del resultado.',
        exitoso: false,
      });
    }

    const partido = partidos[partidoIndex];
    partido.resultadoOficial = {
      golesLocal: request.golesLocal,
      golesVisitante: request.golesVisitante,
      fechaRegistroIso: new Date().toISOString(),
    };

    this.persistirPartidos(partidos);

    const usuariosRecalculados = this.recalcularPuntosUsuarios(partido.id);
    return of({
      data: {
        partido,
        usuariosRecalculados,
      },
      mensaje: 'Resultado actualizado correctamente. Se recalcularon los puntos de usuarios afectados.',
      exitoso: true,
    });
  }

  private obtenerPartidosDesdeCookie(): PartidoGrupo[] {
    return this.cookieService.check(this.key)
      ? (JSON.parse(this.cookieService.get(this.key)) as PartidoGrupo[])
      : [];
  }

  private persistirPartidos(partidos: PartidoGrupo[]): void {
    this.cookieService.set(this.key, JSON.stringify(partidos));
  }

  private recalcularPuntosUsuarios(partidoId: number): number {
    const keyPronosticos = 'pronosticos';
    const pronosticos = this.cookieService.check(keyPronosticos)
      ? (JSON.parse(this.cookieService.get(keyPronosticos)) as Array<{ partidoId?: number }>)
      : [];

    const usuariosAfectados = pronosticos.filter((item) => item.partidoId === partidoId).length;
    this.cookieService.set(
      'ultimo_recalculo_puntos',
      JSON.stringify({ partidoId, fechaIso: new Date().toISOString(), usuariosAfectados })
    );

    return usuariosAfectados;
  }
}
