import { Component } from '@angular/core';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminNoteService } from '../../services/admin-note-service';
import { HttpClient } from '@angular/common/http';

interface Classe {
  id_classe: number;
  nom_classe: string;
  niveau: string;
  specialite: string;
  nb_etudiants: number;
}

interface Matiere {
  id_matiere: number;
  nom_matiere: string;
  coefficient: number;  // number, pas string
  semestre: 'S1' | 'S2';  // string, pas number
}


interface Note {
  etudiant_id: number;
  nom: string;
  prenom: string;
  id_matiere: number;
  nom_matiere: string;
  coefficient: number;
  semestre: number;
  note_ds: number;
  note_examen: number;
  moyenne: number;
}

interface EtudiantNotes {
  etudiant_id: number;
  nom: string;
  prenom: string;
  notes: Note[];
}

@Component({
  selector: 'app-admin-notes',
  imports: [AdminSidebar,CommonModule,RouterModule,FormsModule],
  templateUrl: './admin-notes.html',
  styleUrl: './admin-notes.css',
})
export class AdminNotes {
  classes: Classe[] = [];
  matieres: Matiere[] = [];
  notes: Note[] = [];
  
  selectedClasse: Classe | null = null;
  selectedMatiere: Matiere | null = null;
  selectedSemestre: number = 1;
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // Pour l'affichage groupé par étudiant
  etudiantsNotes: EtudiantNotes[] = [];

  private apiUrl = 'http://localhost:3000/api/admin'; // Ajustez selon votre configuration

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  // Charger toutes les classes
  loadClasses(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.http.get<Classe[]>(`${this.apiUrl}/classes-admin`).subscribe({
      next: (data) => {
        this.classes = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des classes';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Quand une classe est sélectionnée
  onClasseSelect(classe: Classe | null): void {
    if (!classe) return;
    
    this.selectedClasse = classe;
    this.selectedMatiere = null;
    this.notes = [];
    this.etudiantsNotes = [];
    this.loadMatieres(classe.id_classe);
  }

  // Charger les matières d'une classe
  loadMatieres(classeId: number): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.http.get<Matiere[]>(`${this.apiUrl}/classes/${classeId}/matieres`).subscribe({
      next: (data) => {
        this.matieres = data;
        console.log('Matières chargées:', data);
        
        // Si aucune matière n'est trouvée pour cette classe, essayer de charger toutes les matières
        if (data.length === 0) {
          console.warn('Aucune matière trouvée pour cette classe, chargement de toutes les matières');
          this.loadAllMatieres();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des matières';
        console.error('Erreur loadMatieres:', error);
        this.loading = false;
      }
    });
  }

  // Charger toutes les matières (fallback)
  loadAllMatieres(): void {
    this.http.get<Matiere[]>(`${this.apiUrl}/classes/0/matieres-all`).subscribe({
      next: (data) => {
        this.matieres = data;
        console.log('Toutes les matières chargées:', data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur loadAllMatieres:', error);
        this.loading = false;
      }
    });
  }

  // Quand une matière est sélectionnée
  onMatiereSelect(matiere: Matiere | null): void {
    this.selectedMatiere = matiere;
    if (matiere) {
      this.loadNotesByMatiere();
    }
  }

  // Charger les notes d'une matière spécifique
  loadNotesByMatiere(): void {
    if (!this.selectedClasse || !this.selectedMatiere) return;
    
    this.loading = true;
    this.errorMessage = '';
    const url = `${this.apiUrl}/notes-classe/${this.selectedClasse.id_classe}/matiere/${this.selectedMatiere.id_matiere}`;
    
    this.http.get<Note[]>(url).subscribe({
      next: (data) => {
        this.notes = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des notes';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Charger toutes les notes d'un semestre
  loadNotesBySemestre(): void {
    if (!this.selectedClasse) return;
    
    this.loading = true;
    this.errorMessage = '';
    const url = `${this.apiUrl}/notes-classe/${this.selectedClasse.id_classe}/semestre/${this.selectedSemestre}`;
    
    this.http.get<Note[]>(url).subscribe({
      next: (data) => {
        this.notes = data;
        this.groupNotesByStudent();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des notes';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Grouper les notes par étudiant
  groupNotesByStudent(): void {
    const groupedMap = new Map<number, EtudiantNotes>();
    
    this.notes.forEach(note => {
      if (!groupedMap.has(note.etudiant_id)) {
        groupedMap.set(note.etudiant_id, {
          etudiant_id: note.etudiant_id,
          nom: note.nom,
          prenom: note.prenom,
          notes: []
        });
      }
      groupedMap.get(note.etudiant_id)!.notes.push(note);
    });
    
    this.etudiantsNotes = Array.from(groupedMap.values());
  }

  // Mettre à jour une note
  updateNote(note: Note): void {
    // Validation
    if (!note.note_ds && note.note_ds !== 0) {
      this.errorMessage = 'La note DS est requise';
      return;
    }
    if (!note.note_examen && note.note_examen !== 0) {
      this.errorMessage = 'La note Examen est requise';
      return;
    }
    if (note.note_ds < 0 || note.note_ds > 20) {
      this.errorMessage = 'La note DS doit être entre 0 et 20';
      return;
    }
    if (note.note_examen < 0 || note.note_examen > 20) {
      this.errorMessage = 'La note Examen doit être entre 0 et 20';
      return;
    }

    const data = {
      etudiant_id: note.etudiant_id,
      matiere_id: this.selectedMatiere?.id_matiere || note.id_matiere,
      semestre: this.selectedMatiere?.semestre || note.semestre,
      note_ds: parseFloat(note.note_ds.toString()),
      note_examen: parseFloat(note.note_examen.toString())
    };

    this.http.put(`${this.apiUrl}/notes/update`, data).subscribe({
      next: () => {
        this.successMessage = 'Note mise à jour avec succès';
        this.errorMessage = '';
        setTimeout(() => this.successMessage = '', 3000);
        
        // Recalculer la moyenne
        note.moyenne = parseFloat((note.note_ds * 0.3 + note.note_examen * 0.7).toFixed(2));
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour de la note';
        console.error(error);
      }
    });
  }

  // Obtenir la note d'un étudiant pour une matière
  getNoteForMatiere(notes: Note[], matiereId: number): Note | undefined {
    return notes.find(n => n.id_matiere === matiereId);
  }

  // Filtrer les matières par semestre
getMatieresBySemestre(): Matiere[] {
  // Convertir number → string pour matcher les données
  const semestreStr = this.selectedSemestre === 1 ? 'S1' : 'S2';
  console.log('Filtre semestre:', semestreStr, '→', this.matieres.length, 'matières');
  
  return this.matieres.filter(m => m.semestre === semestreStr);
}


  // Calculer la moyenne générale
  getMoyenneGenerale(): number {
    if (this.notes.length === 0) return 0;
    const total = this.notes.reduce((sum, note) => sum + (note.moyenne || 0), 0);
    return parseFloat((total / this.notes.length).toFixed(2));
  }

  // Calculer la moyenne d'un étudiant
  getMoyenneEtudiant(notes: Note[]): number {
    if (notes.length === 0) return 0;
    
    let totalPondere = 0;
    let totalCoefficients = 0;
    
    notes.forEach(note => {
      if (note.moyenne > 0) {
        totalPondere += note.moyenne * note.coefficient;
        totalCoefficients += note.coefficient;
      }
    });
    
    return totalCoefficients > 0 ? parseFloat((totalPondere / totalCoefficients).toFixed(2)) : 0;
  }

  // Export Excel (à implémenter selon vos besoins)
  exportToExcel(): void {
    // Utiliser une bibliothèque comme xlsx pour l'export
    console.log('Export Excel - À implémenter');
    alert('Fonctionnalité d\'export Excel à venir');
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.selectedClasse = null;
    this.selectedMatiere = null;
    this.selectedSemestre = 1;
    this.matieres = [];
    this.notes = [];
    this.etudiantsNotes = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Rechercher une classe
  searchClasse(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.loadClasses();
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.classes = this.classes.filter(c => 
      c.nom_classe.toLowerCase().includes(term) ||
      c.niveau.toLowerCase().includes(term)
    );
  }
}
