export interface Equipo {
  idEquipo: number;
  nombre: string;
  idGrupo?: string;
  nombreGrupo?: string;
  fechaCreacion: string;
}

export interface EquipoRegistrarRequest {
  nombre: string;
  idGrupo?: string;
}

export interface EquipoAsignarGrupoRequest {
  idGrupo: string;
}

export interface GrupoComposicion {
  grupo: string;
  equipos: Equipo[];
}

export interface ApiResponse<T> {
  data: T;
  mensaje: string;
  exitoso: boolean;
}
