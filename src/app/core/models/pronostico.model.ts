import { PartidoGrupo } from './calendario.model';

export interface Pronostico {
  id: number;
  usuarioId: number;
  partidoId: number;
  golesLocal: number;
  golesVisitante: number;
  fechaRegistroIso: string;
}

export interface RegistrarPronosticoRequest {
  usuarioId: number;
  partidoId: number;
  golesLocal: number;
  golesVisitante: number;
}

export interface RegistroPronosticoResponse {
  pronostico: Pronostico;
  partido: PartidoGrupo;
}
