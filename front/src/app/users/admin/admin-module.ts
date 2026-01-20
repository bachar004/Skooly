import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminAcceuil } from './pages/admin-acceuil/admin-acceuil';
import { AdminSidebar } from './pages/admin-sidebar/admin-sidebar';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminLogin,
    AdminAcceuil,
    AdminSidebar
  ]
})
export class AdminModule { }
