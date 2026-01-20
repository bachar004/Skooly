import { Component } from '@angular/core';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Absence {
  id_absence: number;
  etudiant_id: number;
  nom: string;
  prenom: string;
  classe_nom: string;
  date_absence: string;
  heure: string;
  motif: string;
  justifiee: boolean;
  duree: number;
}

interface ClasseAbsences {
  id_classe: number;
  nom_classe: string;
  niveau: string;
  total_absences: number;
  total_heures: number;
  absences: Absence[];
}

@Component({
  selector: 'app-admin-abscences',
  imports: [AdminSidebar,RouterModule,FormsModule,CommonModule],
  templateUrl: './admin-abscences.html',
  styleUrl: './admin-abscences.css',
})
export class AdminAbscences {

  classes: ClasseAbsences[] = [];
  selectedClasseId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  loading = false;
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadClassesAbsences();
  }

  loadClassesAbsences(): void {
    this.loading = true;
    const params = this.selectedDate ? `?date=${this.selectedDate}` : '';
    this.http.get<ClasseAbsences[]>(`${this.apiUrl}/absences/classes${params}`).subscribe({
      next: (data) => {
        this.classes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement absences:', err);
        this.loading = false;
      }
    });
  }

  onDateChange(): void {
    this.selectedClasseId = null; // Reset filtre classe
    this.loadClassesAbsences();
  }

  onClasseChange(): void {
    // Le filtrage se fait dans getFilteredClasses()
  }

  getFilteredClasses(): ClasseAbsences[] {
    let filtered = this.classes;
    if (this.selectedClasseId) {
      filtered = filtered.filter(c => c.id_classe === this.selectedClasseId);
    }
    return filtered.sort((a, b) => 
      b.total_absences - a.total_absences || a.nom_classe.localeCompare(b.nom_classe)
    );
  }

  getTotalAbsences(): number {
    return this.classes.reduce((sum, c) => sum + c.total_absences, 0);
  }

  getClassesWithAbsences(): number {
    return this.classes.filter(c => c.total_absences > 0).length;
  }

}
