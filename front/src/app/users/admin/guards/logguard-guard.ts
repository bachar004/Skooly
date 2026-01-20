import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { AdminConnexion } from '../services/admin-connexion';

@Injectable({
  providedIn: 'root'
})
export class logguardGuard implements CanActivateChild {
  private router = inject(Router);
  private service = inject(AdminConnexion);
  canActivateChild(){
    return this.checkAuth();
  }

  private checkAuth(){
    if(this.service.isLoggedIn()){
      return true;
    }else{
      this.router.navigate(['/login/admin']);
      return false;
    }
  }
}
