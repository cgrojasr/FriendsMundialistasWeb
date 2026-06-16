export interface PartidoGrupo {
  id: number;
  grupo: string;
  equipoLocalId: number;
  equipoLocalNombre: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre: string;
  fechaHoraIso: string;
}

export interface PartidoGrupoRegistrarRequest {
  grupo: string;
  equipoLocalId: number;
  equipoLocalNombre: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre: string;
  fechaHoraIso: string;
}
