import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ApiResponse } from '../models/equipo.model';
import { PartidoGrupo, PartidoGrupoRegistrarRequest } from '../models/calendario.model';

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
}
