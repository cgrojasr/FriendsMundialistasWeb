export interface PartidoGrupo {
  id: number;
  grupo: string;
  equipoLocalId: number;
  equipoLocalNombre: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre: string;
  fechaHoraIso: string;
  fase?: string;
  resultadoOficial?: ResultadoOficial;
}

export interface ResultadoOficial {
  golesLocal: number;
  golesVisitante: number;
  fechaRegistroIso: string;
}

export interface PartidoGrupoRegistrarRequest {
  grupo: string;
  equipoLocalId: number;
  equipoLocalNombre: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre: string;
  fechaHoraIso: string;
}

export interface RegistrarResultadoRequest {
  partidoId: number;
  golesLocal: number;
  golesVisitante: number;
}

export interface ActualizarResultadoRequest {
  partidoId: number;
  golesLocal: number;
  golesVisitante: number;
  confirmarActualizacion: boolean;
}

export interface RegistroResultadoResponse {
  partido: PartidoGrupo;
  usuariosRecalculados: number;
}
