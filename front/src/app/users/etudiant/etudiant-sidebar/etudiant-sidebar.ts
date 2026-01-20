import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EtudiantConnexionService } from '../etudiant-connexion-service';

@Component({
  selector: 'app-etudiant-sidebar',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './etudiant-sidebar.html',
  styleUrl: './etudiant-sidebar.css',
})
export class EtudiantSidebar {
constructor(public rout:Router,private service: EtudiantConnexionService){}
redirect(){
  this.service.logout();
}
}
