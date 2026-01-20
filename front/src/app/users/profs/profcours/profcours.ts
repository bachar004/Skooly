import { Component, OnInit } from '@angular/core';
import { Profsidebar } from '../profsidebar/profsidebar';
import { Profservice } from '../profservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';

interface Matiere {
  id_matiere: number;
  nom_matiere: string;
  coefficient: number;
  semestre: number;
  id_classe: number;
  nom_classe: string;
  niveau: string;
}

interface Cours {
  id_cours: number;
  titre: string;
  description: string;
  matiere_id: number;
  classe_id: number;
  semestre: number;
  statut: 'brouillon' | 'publié' | 'archivé';
  date_creation: Date;
  nom_matiere?: string;
  nom_classe?: string;
  nb_documents?: number;
}

interface Document {
  id_document: number;
  nom_original: string;
  type_fichier: string;
  taille_fichier: number;
  date_upload: Date;
  description?: string;
  telecharge_count: number;
}



@Component({
  selector: 'app-profcours',
  imports: [Profsidebar,FormsModule,CommonModule],
  templateUrl: './profcours.html',
  styleUrl: './profcours.css',
})
export class Profcours implements OnInit {
  profId!: number ; 
  
  matieres: Matiere[] = [];
  cours: Cours[] = [];
  documents: Document[] = [];
  
  selectedMatiere: Matiere | null = null;
  selectedCours: Cours | null = null;
  
  // Pour la création/édition de cours
  showCoursModal = false;
  coursForm = {
    id_cours: null as number | null,
    titre: '',
    description: '',
    matiere_id: 0,
    classe_id: 0,
    semestre: 1,
    statut: 'brouillon' as 'brouillon' | 'publié' | 'archivé',
    ordre: 0
  };
  
  // Pour l'upload de fichiers
  showUploadModal = false;
  selectedFiles: File[] = [];
  uploadProgress = 0;
  isUploading = false;
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  private apiUrl = 'http://localhost:3000/api/cours';

  constructor(private http: HttpClient, private service:Profservice) {}

  ngOnInit(): void {
    this.profId=this.service.getuserid()
    this.loadMatieres();
    console.log('🔍 Debug - Chargement matières profId:', this.profId); // DEBUG
  }

  // Charger les matières du professeur
  loadMatieres(): void {
    this.loading = true;
    this.http.get<Matiere[]>(`${this.apiUrl}/prof/${this.profId}/matieres`).subscribe({
      next: (data) => {
        this.matieres = data;
        this.loading = false;
        
        if (data.length > 0) {
          this.selectedMatiere = data[0];
          this.loadCours();
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des matières';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Charger les cours d'une matière
  loadCours(): void {
    if (!this.selectedMatiere) return;
    
    this.loading = true;
    const params = {
      matiere_id: this.selectedMatiere.id_matiere.toString(),
      classe_id: this.selectedMatiere.id_classe.toString()
    };
    
    this.http.get<Cours[]>(`${this.apiUrl}/prof/${this.profId}/cours`, { params }).subscribe({
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

  // Sélectionner une matière
  selectMatiere(matiere: Matiere): void {
    this.selectedMatiere = matiere;
    this.selectedCours = null;
    this.documents = [];
    this.loadCours();
  }

  // Ouvrir le modal de création/édition de cours
  openCoursModal(cours?: Cours): void {
    if (cours) {
      // Édition
      this.coursForm = {
        id_cours: cours.id_cours,
        titre: cours.titre,
        description: cours.description,
        matiere_id: cours.matiere_id,
        classe_id: cours.classe_id,
        semestre: cours.semestre,
        statut: cours.statut,
        ordre:0
      };
    } else {
      // Création
      this.coursForm = {
        id_cours: null,
        titre: '',
        description: '',
        matiere_id: this.selectedMatiere?.id_matiere || 0,
        classe_id: this.selectedMatiere?.id_classe || 0,
        semestre: this.selectedMatiere?.semestre || 1,
        statut: 'brouillon',
        ordre: this.cours.length + 1
      };
    }
    this.showCoursModal = true;
  }

  // Fermer le modal
  closeCoursModal(): void {
    this.showCoursModal = false;
    this.coursForm = {
      id_cours: null,
      titre: '',
      description: '',
      matiere_id: 0,
      classe_id: 0,
      semestre: 1,
      statut: 'brouillon',
      ordre: 0
    };
  }

  // Sauvegarder le cours
  saveCours(): void {
    if (!this.coursForm.titre.trim()) {
      this.errorMessage = 'Le titre est requis';
      return;
    }

    const data = {
      ...this.coursForm,
      prof_id: this.profId
    };

    const request = this.coursForm.id_cours
      ? this.http.put(`${this.apiUrl}/cours/${this.coursForm.id_cours}`, data)
      : this.http.post(`${this.apiUrl}/cours`, data);

    request.subscribe({
      next: (response: any) => {
        this.successMessage = this.coursForm.id_cours 
          ? 'Cours mis à jour avec succès' 
          : 'Cours créé avec succès';
        setTimeout(() => this.successMessage = '', 3000);
        
        this.closeCoursModal();
        this.loadCours();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la sauvegarde du cours';
        console.error(error);
      }
    });
  }

  // Supprimer un cours
  deleteCours(coursId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours et tous ses documents ?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/cours/${coursId}`).subscribe({
      next: () => {
        this.successMessage = 'Cours supprimé avec succès';
        setTimeout(() => this.successMessage = '', 3000);
        this.loadCours();
        
        if (this.selectedCours?.id_cours === coursId) {
          this.selectedCours = null;
          this.documents = [];
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la suppression du cours';
        console.error(error);
      }
    });
  }

  // Voir les détails d'un cours
  viewCours(cours: Cours): void {
    this.selectedCours = cours;
    this.loadDocuments(cours.id_cours);
  }

  // Charger les documents d'un cours
  loadDocuments(coursId: number): void {
    this.http.get<any>(`${this.apiUrl}/cours/${coursId}`).subscribe({
      next: (data) => {
        this.documents = data.documents || [];
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des documents';
        console.error(error);
      }
    });
  }

  // Ouvrir le modal d'upload
  openUploadModal(cours: Cours): void {
    this.selectedCours = cours;
    this.showUploadModal = true;
    this.selectedFiles = [];
    this.uploadProgress = 0;
  }

  // Sélectionner des fichiers
  onFileSelected(event: any): void {
    const files = event.target.files;
    this.selectedFiles = Array.from(files);
  }

  // Upload des fichiers
  uploadFiles(): void {
    if (this.selectedFiles.length === 0 || !this.selectedCours) {
      this.errorMessage = 'Veuillez sélectionner au moins un fichier';
      return;
    }

    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    this.isUploading = true;
    this.uploadProgress = 0;

    this.http.post(
      `${this.apiUrl}/cours/${this.selectedCours.id_cours}/documents`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.successMessage = 'Fichiers uploadés avec succès';
          setTimeout(() => this.successMessage = '', 3000);
          
          this.isUploading = false;
          this.showUploadModal = false;
          this.selectedFiles = [];
          this.loadDocuments(this.selectedCours!.id_cours);
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'upload des fichiers';
        console.error(error);
        this.isUploading = false;
      }
    });
  }

  // Supprimer un document
  deleteDocument(documentId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/documents/${documentId}`).subscribe({
      next: () => {
        this.successMessage = 'Document supprimé avec succès';
        setTimeout(() => this.successMessage = '', 3000);
        
        if (this.selectedCours) {
          this.loadDocuments(this.selectedCours.id_cours);
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la suppression du document';
        console.error(error);
      }
    });
  }

  // Télécharger un document
  downloadDocument(documentId: number): void {
    window.open(`${this.apiUrl}/documents/${documentId}/download`, '_blank');
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
    if (type.includes('audio')) return 'fa-file-audio text-secondary';
    if (type.includes('zip') || type.includes('rar')) return 'fa-file-archive text-dark';
    return 'fa-file text-muted';
  }
}
