import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiResponse } from '../models/equipo.model';
import { PartidoGrupo } from '../models/calendario.model';
import {
  Pronostico,
  RegistrarPronosticoRequest,
  RegistroPronosticoResponse,
} from '../models/pronostico.model';

@Injectable({ providedIn: 'root' })
export class PronosticoService {
  private readonly cookieService = inject(CookieService);
  private readonly pronosticosKey = 'pronosticos';
  private readonly partidosKey = 'partidos_grupo';

  getPartidosDisponibles(): Observable<ApiResponse<PartidoGrupo[]>> {
    const disponibles = this.obtenerPartidos().filter((partido) => this.estaDisponible(partido));

    return of({
      data: disponibles.sort((a, b) => a.fechaHoraIso.localeCompare(b.fechaHoraIso)),
      mensaje: 'Partidos disponibles para pronóstico obtenidos correctamente.',
      exitoso: true,
    });
  }

  registrarPronostico(
    request: RegistrarPronosticoRequest
  ): Observable<ApiResponse<RegistroPronosticoResponse>> {
    const partido = this.obtenerPartidos().find((item) => item.id === request.partidoId);

    if (!partido) {
      return of({
        data: null as unknown as RegistroPronosticoResponse,
        mensaje: 'El partido seleccionado no existe.',
        exitoso: false,
      });
    }

    if (!this.estaDisponible(partido)) {
      return of({
        data: null as unknown as RegistroPronosticoResponse,
        mensaje: 'El pronóstico está cerrado para este partido.',
        exitoso: false,
      });
    }

    if (!this.esMarcadorValido(request.golesLocal) || !this.esMarcadorValido(request.golesVisitante)) {
      return of({
        data: null as unknown as RegistroPronosticoResponse,
        mensaje: 'Los goles deben ser números enteros iguales o mayores a cero.',
        exitoso: false,
      });
    }

    const pronosticos = this.obtenerPronosticos();
    const existe = pronosticos.some(
      (item) => item.usuarioId === request.usuarioId && item.partidoId === request.partidoId
    );

    if (existe) {
      return of({
        data: null as unknown as RegistroPronosticoResponse,
        mensaje: 'Ya registraste un pronóstico para este partido.',
        exitoso: false,
      });
    }

    const nuevoPronostico: Pronostico = {
      id: Date.now(),
      usuarioId: request.usuarioId,
      partidoId: request.partidoId,
      golesLocal: request.golesLocal,
      golesVisitante: request.golesVisitante,
      fechaRegistroIso: new Date().toISOString(),
    };

    pronosticos.push(nuevoPronostico);
    this.cookieService.set(this.pronosticosKey, JSON.stringify(pronosticos));

    return of({
      data: {
        pronostico: nuevoPronostico,
        partido,
      },
      mensaje: 'Pronóstico registrado correctamente.',
      exitoso: true,
    });
  }

  private obtenerPartidos(): PartidoGrupo[] {
    return this.cookieService.check(this.partidosKey)
      ? (JSON.parse(this.cookieService.get(this.partidosKey)) as PartidoGrupo[])
      : [];
  }

  private obtenerPronosticos(): Pronostico[] {
    return this.cookieService.check(this.pronosticosKey)
      ? (JSON.parse(this.cookieService.get(this.pronosticosKey)) as Pronostico[])
      : [];
  }

  private estaDisponible(partido: PartidoGrupo): boolean {
    const inicioPartido = new Date(partido.fechaHoraIso).getTime();
    const ahora = Date.now();

    if (Number.isNaN(inicioPartido)) {
      return false;
    }

    if (partido.resultadoOficial) {
      return false;
    }

    return inicioPartido > ahora;
  }

  private esMarcadorValido(valor: number): boolean {
    return Number.isInteger(valor) && valor >= 0;
  }
}
