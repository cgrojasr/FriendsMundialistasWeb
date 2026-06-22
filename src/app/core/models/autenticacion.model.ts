export interface UsuarioDni {
  id: number;
  dni: string;
  creadoEnIso: string;
}

export interface SesionUsuario {
  usuarioId: number;
  fechaIso: string;
}

export interface AutenticacionResponse {
  usuarioId: number;
  usuarioNuevo: boolean;
}
