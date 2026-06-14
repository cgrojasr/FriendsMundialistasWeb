export interface Equipo {
  id: number;
  nombre: string;
  grupo?: string;
}

export interface EquipoRegistrarRequest {
  nombre: string;
  grupo?: string;
}

export interface EquipoAsignarGrupoRequest {
  grupo: string;
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
