import { Router , CanActivateChild } from '@angular/router';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Profservice } from './profservice';

@Injectable({
  providedIn: 'root'
})
export class profGuard implements CanActivateChild{
  private router = inject(Router);
  private service = inject(Profservice);
  canActivateChild(){
    return this.checkAuth();
  }

  private checkAuth(){
    if(this.service.isloggedin()){
      return true;
    }else{
      this.router.navigate(['/login/prof']);
      return false;
    }
  }
};
