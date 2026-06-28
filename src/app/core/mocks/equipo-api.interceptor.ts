import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Equipo,
  EquipoAsignarGrupoRequest,
  EquipoRegistrarRequest,
  GrupoComposicion,
} from '../models/equipo.model';

// ── Base de datos en memoria (simula persistencia durante la sesión) ──
const db: Equipo[] = [];
const MAX_EQUIPOS = 48;
const MAX_EQUIPOS_POR_GRUPO = 4;
const GRUPOS_VALIDOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
let nextId = 1;
const { equipos, gruposComposicion } = environment.apiRoutes;
const gruposPrefix = gruposComposicion.replace('/composicion', '');
const adminEquipos = '/api/admin/equipos';
const adminGruposComposicion = '/api/admin/grupos/composicion';
const adminGruposPrefix = '/api/admin/grupos';
const equipoGrupoRouteRegex = new RegExp(`^${equipos}/\\d+/grupo$`);
const adminEquipoGrupoRouteRegex = /^\/api\/admin\/equipos\/\d+\/grupo$/;

function ok<T>(data: T, mensaje: string): HttpResponse<ApiResponse<T>> {
  return new HttpResponse<ApiResponse<T>>({
    status: 200,
    body: { exitoso: true, mensaje, data },
  });
}

function error(status: number, mensaje: string): HttpResponse<ApiResponse<null>> {
  return new HttpResponse<ApiResponse<null>>({
    status,
    body: { exitoso: false, mensaje, data: null },
  });
}

export const equipoApiInterceptor: HttpInterceptorFn = (req, next) => {
  const { url, method } = req;
  const requestPath = new URL(url, 'http://localhost').pathname;

  // Solo intercepta rutas de la API mock
  const esRutaEquipos = requestPath.startsWith(equipos) || requestPath.startsWith(adminEquipos);
  const esRutaGrupos = requestPath.startsWith(gruposPrefix) || requestPath.startsWith(adminGruposPrefix);
  if (!esRutaEquipos && !esRutaGrupos) {
    return next(req);
  }

  // GET /api/equipos — obtener todos los equipos
  if (method === 'GET' && (requestPath === equipos || requestPath === adminEquipos)) {
    return of(ok([...db], 'Equipos obtenidos correctamente.')).pipe(delay(300));
  }

  // GET /api/grupos/composicion — obtener composición actual por grupo
  if (method === 'GET' && (requestPath === gruposComposicion || requestPath === adminGruposComposicion)) {
    const composicion: GrupoComposicion[] = GRUPOS_VALIDOS.map(idGrupo => ({
      grupo: idGrupo,
      equipos: db.filter(e => e.idGrupo === idGrupo),
    }));
    return of(ok(composicion, 'Composición de grupos obtenida correctamente.')).pipe(delay(300));
  }

  // POST /api/equipos — registrar un nuevo equipo
  if (method === 'POST' && (requestPath === equipos || requestPath === adminEquipos)) {
    const body = req.body as EquipoRegistrarRequest;
    const nombre = body?.nombre?.trim();

    if (!nombre) {
      return of(error(400, 'El nombre del equipo es obligatorio.')).pipe(delay(250));
    }

    const existe = db.some(e => e.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      return of(error(409, `El equipo "${nombre}" ya existe.`)).pipe(delay(250));
    }

    if (db.length >= MAX_EQUIPOS) {
      return of(
        error(422, `Se alcanzó el número máximo de ${MAX_EQUIPOS} equipos permitidos.`)
      ).pipe(delay(250));
    }

    const nuevo: Equipo = {
      idEquipo: nextId++,
      nombre,
      idGrupo: body.idGrupo || undefined,
      fechaCreacion: new Date().toISOString(),
    };
    db.push(nuevo);

    return of(ok(nuevo, `El equipo "${nombre}" fue registrado exitosamente.`)).pipe(delay(400));
  }

  // PUT /api/equipos/:id/grupo — asignar o reasignar un equipo a un grupo
  if (method === 'PUT' && (equipoGrupoRouteRegex.test(requestPath) || adminEquipoGrupoRouteRegex.test(requestPath))) {
    const parts = requestPath.split('/').filter(Boolean);
    const equipoId = Number(parts[parts.length - 2]);
    const body = req.body as EquipoAsignarGrupoRequest;
    const idGrupo = body?.idGrupo?.trim().toUpperCase();

    const equipo = db.find(e => e.idEquipo === equipoId);
    if (!equipo) {
      return of(error(404, 'El equipo no existe.')).pipe(delay(250));
    }

    if (!idGrupo || !GRUPOS_VALIDOS.includes(idGrupo)) {
      return of(error(400, 'El grupo no es válido.')).pipe(delay(250));
    }

    if (equipo.idGrupo === idGrupo) {
      return of(error(409, `El equipo "${equipo.nombre}" ya pertenece al grupo ${idGrupo}.`)).pipe(delay(250));
    }

    const cantidadEnGrupo = db.filter(e => e.idGrupo === idGrupo).length;
    if (cantidadEnGrupo >= MAX_EQUIPOS_POR_GRUPO) {
      return of(error(422, `El grupo ${idGrupo} está completo (máximo ${MAX_EQUIPOS_POR_GRUPO} equipos).`)).pipe(delay(250));
    }

    const eraReasignacion = !!equipo.idGrupo;
    equipo.idGrupo = idGrupo;
    const mensaje = eraReasignacion
      ? `El equipo "${equipo.nombre}" fue reasignado al grupo ${idGrupo} correctamente.`
      : `El equipo "${equipo.nombre}" fue asignado al grupo ${idGrupo} correctamente.`;

    return of(ok({ ...equipo }, mensaje)).pipe(delay(350));
  }

  // Cualquier otra ruta no implementada
  return of(error(404, 'Recurso no encontrado.')).pipe(delay(200));
};
