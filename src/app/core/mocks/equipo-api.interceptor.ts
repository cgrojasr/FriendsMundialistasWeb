import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
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

  // Solo intercepta rutas de la API mock
  if (!url.startsWith('/api/equipos') && !url.startsWith('/api/grupos')) {
    return next(req);
  }

  // GET /api/equipos — obtener todos los equipos
  if (method === 'GET' && url === '/api/equipos') {
    return of(ok([...db], 'Equipos obtenidos correctamente.')).pipe(delay(300));
  }

  // GET /api/grupos/composicion — obtener composición actual por grupo
  if (method === 'GET' && url === '/api/grupos/composicion') {
    const composicion: GrupoComposicion[] = GRUPOS_VALIDOS.map(grupo => ({
      grupo,
      equipos: db.filter(e => e.grupo === grupo),
    }));
    return of(ok(composicion, 'Composición de grupos obtenida correctamente.')).pipe(delay(300));
  }

  // POST /api/equipos — registrar un nuevo equipo
  if (method === 'POST' && url === '/api/equipos') {
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

    const nuevo: Equipo = { id: nextId++, nombre, grupo: body.grupo || undefined };
    db.push(nuevo);

    return of(ok(nuevo, `El equipo "${nombre}" fue registrado exitosamente.`)).pipe(delay(400));
  }

  // PUT /api/equipos/:id/grupo — asignar o reasignar un equipo a un grupo
  if (method === 'PUT' && /^\/api\/equipos\/\d+\/grupo$/.test(url)) {
    const equipoId = Number(url.split('/')[3]);
    const body = req.body as EquipoAsignarGrupoRequest;
    const grupo = body?.grupo?.trim().toUpperCase();

    const equipo = db.find(e => e.id === equipoId);
    if (!equipo) {
      return of(error(404, 'El equipo no existe.')).pipe(delay(250));
    }

    if (!grupo || !GRUPOS_VALIDOS.includes(grupo)) {
      return of(error(400, 'El grupo no es válido.')).pipe(delay(250));
    }

    if (equipo.grupo === grupo) {
      return of(error(409, `El equipo "${equipo.nombre}" ya pertenece al grupo ${grupo}.`)).pipe(delay(250));
    }

    const cantidadEnGrupo = db.filter(e => e.grupo === grupo).length;
    if (cantidadEnGrupo >= MAX_EQUIPOS_POR_GRUPO) {
      return of(error(422, `El grupo ${grupo} está completo (máximo ${MAX_EQUIPOS_POR_GRUPO} equipos).`)).pipe(delay(250));
    }

    const eraReasignacion = !!equipo.grupo;
    equipo.grupo = grupo;
    const mensaje = eraReasignacion
      ? `El equipo "${equipo.nombre}" fue reasignado al grupo ${grupo} correctamente.`
      : `El equipo "${equipo.nombre}" fue asignado al grupo ${grupo} correctamente.`;

    return of(ok({ ...equipo }, mensaje)).pipe(delay(350));
  }

  // Cualquier otra ruta no implementada
  return of(error(404, 'Recurso no encontrado.')).pipe(delay(200));
};
