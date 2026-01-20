import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLogin } from './users/admin/pages/admin-login/admin-login';
import { AdminAcceuil } from './users/admin/pages/admin-acceuil/admin-acceuil';
import { AdminAbscences } from './users/admin/pages/admin-abscences/admin-abscences';
import { AdminNotes } from './users/admin/pages/admin-notes/admin-notes';
import { AdminNotifications } from './users/admin/pages/admin-notifications/admin-notifications';

import { logguardGuard } from './users/admin/guards/logguard-guard';
import { AdminEtudiant } from './users/admin/pages/admin-etudiant/admin-etudiant';
import { AdminProf } from './users/admin/pages/admin-prof/admin-prof';
import { AdminClasses } from './users/admin/pages/admin-classes/admin-classes';
import { AdminEtudiantlist } from './users/admin/pages/admin-etudiantlist/admin-etudiantlist';
import { Loginetudiant } from './users/etudiant/loginetudiant/loginetudiant';
import { EtudiantAcceuil } from './users/etudiant/etudiant-acceuil/etudiant-acceuil';
import { EtudiantCours } from './users/etudiant/etudiant-cours/etudiant-cours';
import { EtudiantAbscences } from './users/etudiant/etudiant-abscences/etudiant-abscences';
import { EtudiantNotes } from './users/etudiant/etudiant-notes/etudiant-notes';
import { EtudiantNotifications } from './users/etudiant/etudiant-notifications/etudiant-notifications';
import { etudiantGuard } from './users/etudiant/etudiant-guard';
import { Proflogin } from './users/profs/proflogin/proflogin';
import { Profcours } from './users/profs/profcours/profcours';
import { Profnotes } from './users/profs/profnotes/profnotes';
import { profGuard } from './users/profs/prof-guard';
import { Profnotifications } from './users/profs/profnotifications/profnotifications';
import { Profacceuil } from './users/profs/profacceuil/profacceuil';

export const routes: Routes = [
  { path: 'login/admin', component: AdminLogin },
  {
    path: 'admin',
    canActivateChild:[logguardGuard],
    children: [
      { path: 'acceuil', component: AdminAcceuil },
      { path: 'etudiant', component: AdminEtudiantlist,        
        children: [
          { path: '', component: AdminEtudiant },
          { path: 'classe/:id', component: AdminClasses }
        ]},
      { path: 'prof', component: AdminProf },
      { path: 'abscences', component: AdminAbscences },
      { path: 'notes', component: AdminNotes },
      { path: 'notifications', component: AdminNotifications },
      { path: '', redirectTo: 'acceuil', pathMatch: 'full' },
      {path :"**", redirectTo:'acceuil'}
    ]
  },
  {
    path: 'login/etudiant' , component : Loginetudiant
  },
  {
    path:'etudiant',
    canActivateChild: [etudiantGuard],
    children:[
      { path: 'acceuil', component: EtudiantAcceuil },
      { path: 'cours', component: EtudiantCours },
      { path: 'abscences', component: EtudiantAbscences },
      { path: 'notes', component: EtudiantNotes },
      { path: 'notifications', component: EtudiantNotifications},
      { path: '', redirectTo: 'acceuil', pathMatch: 'full' },
      {path :"**", redirectTo:'acceuil'}
    ]
  },
  {
    path: 'login/prof' , component : Proflogin
  },
  {
    path:'prof',
    canActivateChild: [profGuard],
    children:[
      { path: 'acceuil', component: Profacceuil },
      { path: 'cours', component: Profcours},
      { path: 'abscences', component: Profacceuil },
      { path: 'notes', component: Profnotes },
      { path: 'notifications', component: Profnotifications},
      { path: '', redirectTo: 'acceuil', pathMatch: 'full' },
      {path :"**", redirectTo:'acceuil'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
