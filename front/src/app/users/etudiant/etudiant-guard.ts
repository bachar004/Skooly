import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { EtudiantConnexionService } from './etudiant-connexion-service';

@Injectable({
  providedIn: 'root'
})
export class etudiantGuard  implements CanActivateChild {
  private router = inject(Router);
  private service = inject(EtudiantConnexionService);
  canActivateChild(){
    return this.checkAuth();
  }

  private checkAuth(){
    if(this.service.isloggedin()){
      return true;
    }else{
      this.router.navigate(['/login/etudiant']);
      return false;
    }
  }
}
