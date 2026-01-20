import { Component } from '@angular/core';
import { EtudiantConnexionService } from '../../etudiant/etudiant-connexion-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Profservice } from '../profservice';

@Component({
  selector: 'app-proflogin',
  imports: [FormsModule,CommonModule],
  templateUrl: './proflogin.html',
  styleUrl: './proflogin.css',
})
export class Proflogin {
loading=false;
mail:string="";
mdp:string="";
constructor(private service:Profservice, private router:Router){}
login(){
  if(this.loading) return;
  this.loading=true;
    this.service.login(this.mail, this.mdp).subscribe({
      next: (res: any) => {
        console.log(res.message)
        alert(res.message);
        localStorage.setItem('token', res.token);
        this.loading = false;
        this.router.navigate(['/prof/acceuil']);
      },
      error: (err) => {
        console.error('Erreur', err);
        alert(err.error.message);
        this.loading = false;
      },
    });
  }
}
