import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AdminConnexion {
  private url = 'http://localhost:3000/api/admin/log_admin';
  private urlotp = 'http://localhost:3000/api/admin/verify-otp'

  constructor(private http: HttpClient, private router: Router) {}

  login(mail: string, mdp: string) {
    return this.http.post(this.url, { mail, mdp });
  }
  verifotp(mail: string, otp: string){
    return this.http.post(this.urlotp,{mail,otp})
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login/admin']); 
  }

  public isLoggedIn(){
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = decodedToken.exp * 1000;

      if (Date.now() >= expirationDate) {
        console.warn('Token expiré');
        this.logout();
        return false;
      }
      return true;

    } catch (error) {
      console.error("Erreur lors du décodage du token", error);
      this.logout();
      return false;
    }
  }
}