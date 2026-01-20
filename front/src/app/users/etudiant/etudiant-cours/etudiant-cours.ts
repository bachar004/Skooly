import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EtudiantSidebar } from '../etudiant-sidebar/etudiant-sidebar';
import { EtudiantConnexionService } from '../etudiant-connexion-service';
import { HttpClient } from '@angular/common/http';
import { Profservice } from '../../profs/profservice';
import { FormsModule } from '@angular/forms';

interface Matiere {
  id_matiere: number;
  nom_matiere: string;
  coefficient: number;
  semestre: number;
  nb_cours: number;
  nb_documents: number;
  prof_nom: string;
}

interface Cours {
  id_cours: number;
  titre: string;
  description: string;
  date_creation: Date;
  date_modification: Date;
  ordre: number;
  nom_matiere: string;
  coefficient: number;
  semestre: number;
  prof_nom: string;
  nb_documents: number;
  date_consultation?: Date;
  progression?: number;
}

interface CoursDetail {
  id_cours: number;
  titre: string;
  description: string;
  nom_matiere: string;
  prof_nom: string;
  prof_email: string;
  nom_classe: string;
  date_creation: Date;
  documents: Document[];
}

interface Document {
  id_document: number;
  nom_original: string;
  type_fichier: string;
  taille_fichier: number;
  date_upload: Date;
  description: string;
  telecharge_count: number;
  deja_telecharge: boolean;
}

interface Stats {
  total_cours_disponibles: number;
  cours_consultes: number;
  documents_telecharges: number;
  progression_moyenne: number;
  temps_total_minutes: number;
}

@Component({
  selector: 'app-etudiant-cours',
  imports: [CommonModule,EtudiantSidebar,FormsModule],
  templateUrl: './etudiant-cours.html',
  styleUrl: './etudiant-cours.css',
})
export class EtudiantCours {
etudiantId!: number; // À récupérer de la session/auth
  
  matieres: Matiere[] = [];
  cours: Cours[] = [];
  coursRecents: Cours[] = [];
  selectedCours: CoursDetail | null = null;
  stats: Stats | null = null;
  
  selectedMatiere: Matiere | null = null;
  selectedSemestre: number | null = null;
  searchTerm: string = '';
  
  // Vues
  currentView: 'list' | 'detail' | 'recent' = 'list';
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  private apiUrl = 'http://localhost:3000/api/cours';

  constructor(private http: HttpClient, private service:Profservice) {}

  ngOnInit(): void {
    this.etudiantId=this.service.getuserid()
    this.loadMatieres();
    this.loadCoursRecents();
    this.loadStats();
  }

  // Charger les matières de la classe
  loadMatieres(): void {
    this.loading = true;
    this.http.get<Matiere[]>(`${this.apiUrl}/etudiant/${this.etudiantId}/matieres`).subscribe({
      next: (data) => {
        this.matieres = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des matières';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Charger les cours
  loadCours(): void {
    this.loading = true;
    const params: any = {};
    
    if (this.selectedMatiere) {
      params.matiere_id = this.selectedMatiere.id_matiere.toString();
    }
    if (this.selectedSemestre) {
      params.semestre = this.selectedSemestre.toString();
    }
    
    this.http.get<Cours[]>(`${this.apiUrl}/etudiant/${this.etudiantId}/cours`, { params }).subscribe({
      next: (data) => {
        this.cours = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des cours';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Charger les cours récents
  loadCoursRecents(): void {
    this.http.get<Cours[]>(`${this.apiUrl}/etudiant/${this.etudiantId}/cours/recents`).subscribe({
      next: (data) => {
        this.coursRecents = data;
      },
      error: (error) => {
        console.error('Erreur cours récents:', error);
      }
    });
  }

  // Charger les statistiques
  loadStats(): void {
    this.http.get<Stats>(`${this.apiUrl}/etudiant/${this.etudiantId}/stats`).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Erreur stats:', error);
      }
    });
  }

  // Sélectionner une matière
  selectMatiere(matiere: Matiere | null): void {
    this.selectedMatiere = matiere;
    this.currentView = 'list';
    this.loadCours();
  }

  // Filtrer par semestre
  filterSemestre(semestre: number | null): void {
    this.selectedSemestre = semestre;
    this.loadCours();
  }

  // Voir les détails d'un cours
  viewCours(cours: Cours): void {
    this.loading = true;
    this.http.get<CoursDetail>(`${this.apiUrl}/etudiant/${this.etudiantId}/cours/${cours.id_cours}`).subscribe({
      next: (data) => {
        this.selectedCours = data;
        this.currentView = 'detail';
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du cours';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Retour à la liste
  backToList(): void {
    this.selectedCours = null;
    this.currentView = 'list';
    this.loadCours(); // Recharger pour mettre à jour les consultations
  }

  // Télécharger un document
  downloadDocument(documentId: number): void {
    window.open(
      `${this.apiUrl}/etudiant/${this.etudiantId}/documents/${documentId}/download`,
      '_blank'
    );
    
    // Recharger les détails du cours pour mettre à jour le statut de téléchargement
    if (this.selectedCours) {
      setTimeout(() => {
        this.viewCours({ id_cours: this.selectedCours!.id_cours } as Cours);
      }, 500);
    }
  }

  // Rechercher des cours
  searchCours(): void {
    if (!this.searchTerm.trim()) {
      this.loadCours();
      return;
    }
    
    this.loading = true;
    this.http.get<Cours[]>(
      `${this.apiUrl}/etudiant/${this.etudiantId}/cours/search/${this.searchTerm}`
    ).subscribe({
      next: (data) => {
        this.cours = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la recherche';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Marquer la progression
  updateProgression(coursId: number, progression: number): void {
    const data = {
      progression: progression,
      duree_minutes: 0
    };
    
    this.http.post(
      `${this.apiUrl}/etudiant/${this.etudiantId}/cours/${coursId}/progression`,
      data
    ).subscribe({
      next: () => {
        this.successMessage = 'Progression enregistrée';
        setTimeout(() => this.successMessage = '', 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'enregistrement';
        console.error(error);
      }
    });
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.selectedMatiere = null;
    this.selectedSemestre = null;
    this.searchTerm = '';
    this.loadCours();
  }

  // Formater la taille du fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Obtenir l'icône du type de fichier
  getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'fa-file-pdf text-danger';
    if (type.includes('word') || type.includes('document')) return 'fa-file-word text-primary';
    if (type.includes('excel') || type.includes('sheet')) return 'fa-file-excel text-success';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'fa-file-powerpoint text-warning';
    if (type.includes('image')) return 'fa-file-image text-info';
    if (type.includes('video')) return 'fa-file-video text-purple';
    return 'fa-file text-muted';
  }

  // Obtenir la couleur de progression
  getProgressColor(progression: number): string {
    if (progression >= 75) return 'success';
    if (progression >= 50) return 'info';
    if (progression >= 25) return 'warning';
    return 'danger';
  }

  // Grouper les cours par matière
  getCoursByMatiere(): Map<string, Cours[]> {
    const grouped = new Map<string, Cours[]>();
    this.cours.forEach(c => {
      if (!grouped.has(c.nom_matiere)) {
        grouped.set(c.nom_matiere, []);
      }
      grouped.get(c.nom_matiere)!.push(c);
    });
    return grouped;
  }

  

colors = ["primary", "success", "info", "secondary","black"];

getColor(index: number) {
  return this.colors[index % this.colors.length];
}
getDescription(cours: any): string {
  if (!cours?.description || cours.description.length === 0) {
    return 'Pas de description';
  }
  return cours.description.length > 100 
    ? cours.description.substring(0, 100) + '...' 
    : cours.description;
}
}
