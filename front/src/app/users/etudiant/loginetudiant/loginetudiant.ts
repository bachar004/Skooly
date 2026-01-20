import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtudiantConnexionService } from '../etudiant-connexion-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loginetudiant',
  imports: [CommonModule,FormsModule],
  templateUrl: './loginetudiant.html',
  styleUrl: './loginetudiant.css',
})
export class Loginetudiant {
loading=false;
mail:string="";
mdp:string="";
constructor(private service:EtudiantConnexionService, private router:Router){}
login(){
  if(this.loading) return;
  this.loading=true;
    this.service.login(this.mail, this.mdp).subscribe({
      next: (res: any) => {
        console.log(res.message)
        alert(res.message);
        localStorage.setItem('token', res.token);
        this.loading = false;
        this.router.navigate(['/etudiant/acceuil']);
      },
      error: (err) => {
        console.error('Erreur', err);
        alert(err.error.message);
        this.loading = false;
      },
    });
  }
}
