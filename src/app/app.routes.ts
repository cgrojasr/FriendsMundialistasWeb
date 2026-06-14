import { Routes } from '@angular/router';
import { EquipoRegistrar } from './administracion/equipo-registrar/equipo-registrar';
import { EquipoAsignarGrupo } from './administracion/equipo-asignar-grupo/equipo-asignar-grupo';

export const routes: Routes = [
  { path: 'administracion/equipo-registrar', component: EquipoRegistrar },
  { path: 'administracion/equipo-asignar-grupo', component: EquipoAsignarGrupo },
  { path: '', redirectTo: 'administracion/equipo-registrar', pathMatch: 'full' },
];
