import { Routes } from '@angular/router';
import { EquipoRegistrar } from './administracion/equipo-registrar/equipo-registrar';
import { EquipoAsignarGrupo } from './administracion/equipo-asignar-grupo/equipo-asignar-grupo';
import { EquipoVisualizarGrupo } from './administracion/equipo-visualizar-grupo/equipo-visualizar-grupo';
import { CalendarioRegistrar } from './administracion/calendario-registrar/calendario-registrar';
import { CalendarioVisualizar } from './administracion/calendario-visualizar/calendario-visualizar';
import { CalendarioResultado } from './administracion/calendario-resultado/calendario-resultado';
import { Autenticacion } from './seguridad/autenticacion/autenticacion';
import { UsuarioRegistrar } from './seguridad/usuario-registrar/usuario-registrar';
import { PronosticoRegistrar } from './pronostico/pronostico-registrar/pronostico-registrar';

export const routes: Routes = [
  { path: 'administracion/equipo-registrar', component: EquipoRegistrar },
  { path: 'administracion/equipo-asignar-grupo', component: EquipoAsignarGrupo },
  { path: 'administracion/equipo-visualizar-grupo', component: EquipoVisualizarGrupo },
  { path: 'administracion/calendario-registrar', component: CalendarioRegistrar },
  { path: 'administracion/calendario-visualizar', component: CalendarioVisualizar },
  { path: 'administracion/calendario-resultado', component: CalendarioResultado },
  { path: 'seguridad/autenticacion', component: Autenticacion },
  { path: 'seguridad/usuario-registrar', component: UsuarioRegistrar },
  { path: 'pronostico/pronostico-registrar', component: PronosticoRegistrar },
  { path: '', redirectTo: 'administracion/equipo-registrar', pathMatch: 'full' },
];
