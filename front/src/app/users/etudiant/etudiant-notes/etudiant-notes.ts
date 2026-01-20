import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EtudiantSidebar } from '../etudiant-sidebar/etudiant-sidebar';
import { EtudiantConnexionService, NoteEtudiant } from '../etudiant-connexion-service';

@Component({
  selector: 'app-etudiant-notes',
  imports: [CommonModule,EtudiantSidebar],
  templateUrl: './etudiant-notes.html',
  styleUrl: './etudiant-notes.css',
})
export class EtudiantNotes {
notes: NoteEtudiant[] = [];
  etudiantId!: number;
  loading = true;

  constructor(public service: EtudiantConnexionService) {}

  ngOnInit(): void {
    this.etudiantId = this.service.getuserid();
    this.chargerNotes();
  }

  chargerNotes(): void {
    this.loading = true;
    this.service.getMesNotes(this.etudiantId).subscribe({
      next: (data :any) => {
        this.notes = data;
        this.loading = false;
      },
      error: (err:any) => {
        console.error('Erreur notes:', err);
        this.notes = [];
        this.loading = false;
      }
    });
  }
}
