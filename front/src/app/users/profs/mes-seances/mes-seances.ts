// mes-seances.component.ts
import { Component, OnInit } from '@angular/core';
import { Profservice } from '../profservice';
import { Router } from '@angular/router';

interface Seance {
  id: number;
  nom_matiere: string;
  nom_classe: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  salle: string;
}

@Component({
  selector: 'app-mes-seances',
  templateUrl: './mes-seances.html'
})
export class MesSeances{
  
}
