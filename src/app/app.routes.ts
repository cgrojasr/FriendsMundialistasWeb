import { Routes } from '@angular/router';
import { EquipoRegistrar } from './administracion/equipo-registrar/equipo-registrar';
import { EquipoAsignarGrupo } from './administracion/equipo-asignar-grupo/equipo-asignar-grupo';
import { EquipoVisualizarGrupo } from './administracion/equipo-visualizar-grupo/equipo-visualizar-grupo';
import { CalendarioRegistrar } from './administracion/calendario-registrar/calendario-registrar';
import { CalendarioVisualizar } from './administracion/calendario-visualizar/calendario-visualizar';

export const routes: Routes = [
  { path: 'administracion/equipo-registrar', component: EquipoRegistrar },
  { path: 'administracion/equipo-asignar-grupo', component: EquipoAsignarGrupo },
  { path: 'administracion/equipo-visualizar-grupo', component: EquipoVisualizarGrupo },
  { path: 'administracion/calendario-registrar', component: CalendarioRegistrar },
  { path: 'administracion/calendario-visualizar', component: CalendarioVisualizar },
  { path: '', redirectTo: 'administracion/equipo-registrar', pathMatch: 'full' },
];
