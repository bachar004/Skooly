import { Component, OnInit } from '@angular/core';
import { Profsidebar } from '../profsidebar/profsidebar';
import { Profservice } from '../profservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Seance {
  id_sceance: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  salle: string;
  annee_scolaire: string;
  id_classe: number;
  nom_classe: string;
  niveau: string;
  id_matiere: number;
  nom_matiere: string;
}

interface Classe {
  id_classe: number;
  nom_classe: string;
  niveau: string;
  annee_scolaire: string;
  nombre_seances: number;
  nombre_etudiants: number;
}

interface Matiere {
  id_matiere: number;
  nom_matiere: string;
  nombre_seances: number;
  nombre_classes: number;
}

interface Etudiant {
  id_etudiant: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  id_presence: number | null;
  statut: string | null;
  remarque: string | null;
  date_saisie: string | null;
}

@Component({
  selector: 'app-profacceuil',
  standalone: true,
  imports: [CommonModule, FormsModule, Profsidebar],
  templateUrl: './profacceuil.html',
  styleUrl: './profacceuil.css'
})
export class Profacceuil implements OnInit {
  profId!: number;
  
  // Données
  emploiComplet: Seance[] = [];
  emploiParJour: { [key: string]: Seance[] } = {};
  classes: Classe[] = [];
  matieres: Matiere[] = [];
  
  // Filtres
  classeSelectionnee: number = 0;
  matiereSelectionnee: number = 0;
  
  // Vue
  vueActive: 'semaine' | 'jour' | 'classes' = 'semaine';
  jourSelectionne: string = '';
  
  // UI
  isLoading: boolean = false;
  errorMessage: string = '';
  messageSucces: string = '';
  
  // Liste des jours
  jours: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  // Modal Appel
  showAppelModal: boolean = false;
  seanceSelectionnee: Seance | null = null;
  dateAppel: string = '';
  etudiantsAppel: Etudiant[] = [];
  loadingAppel: boolean = false;
  savingAppel: boolean = false;
  dejaSaisi: boolean = false;
  
  statsAppel = {
    presents: 0,
    absents: 0,
    retards: 0,
    justifies: 0
  };
  
  constructor(private service: Profservice) {}

  ngOnInit() {
    this.profId = this.service.getuserid();
    
    if (!this.profId) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      return;
    }

    this.chargerDonnees();
  }

  // ========== CHARGEMENT DES DONNÉES ==========
  
  chargerDonnees() {
    this.isLoading = true;
    this.errorMessage = '';

    // Charger l'emploi du temps
    this.service.getEmploiDuTemps(this.profId).subscribe({
      next: (emploi: any) => {
        this.emploiComplet = emploi;
        this.grouperParJour();
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur emploi:', err);
        this.errorMessage = 'Erreur lors du chargement de l\'emploi du temps.';
        this.isLoading = false;
      }
    });

    // Charger les classes
    this.service.getMesClasses(this.profId).subscribe({
      next: (classes: any) => {
        this.classes = classes;
      },
      error: (err) => {
        console.error('Erreur classes:', err);
      }
    });

    // Charger les matières
    this.service.getMesMatieres(this.profId).subscribe({
      next: (matieres: any) => {
        this.matieres = matieres;
      },
      error: (err) => {
        console.error('Erreur matières:', err);
      }
    });
  }

  // ========== GESTION DES VUES ==========

  grouperParJour() {
    this.emploiParJour = {};
    
    this.jours.forEach(jour => {
      this.emploiParJour[jour] = this.emploiComplet
        .filter(s => s.jour === jour)
        .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
    });
  }

  changerVue(vue: 'semaine' | 'jour' | 'classes') {
    this.vueActive = vue;
    
    if (vue === 'jour' && !this.jourSelectionne) {
      const aujourdhui = new Date();
      const joursIndex = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      this.jourSelectionne = joursIndex[aujourdhui.getDay()];
    }
  }

  selectionnerJour(jour: string) {
    this.jourSelectionne = jour;
  }

  getSeancesDuJour(): Seance[] {
    if (!this.jourSelectionne) return [];
    return this.emploiParJour[this.jourSelectionne] || [];
  }

  appliquerFiltres() {
    let seancesFiltrees = [...this.emploiComplet];

    if (this.classeSelectionnee > 0) {
      seancesFiltrees = seancesFiltrees.filter(s => s.id_classe === this.classeSelectionnee);
    }

    if (this.matiereSelectionnee > 0) {
      seancesFiltrees = seancesFiltrees.filter(s => s.id_matiere === this.matiereSelectionnee);
    }

    // Regrouper les séances filtrées
    this.emploiParJour = {};
    this.jours.forEach(jour => {
      this.emploiParJour[jour] = seancesFiltrees
        .filter(s => s.jour === jour)
        .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
    });
  }

  // ========== UTILITAIRES ==========

  getCouleurMatiere(idMatiere: number): string {
    const couleurs = [
      '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
      '#F44336', '#00BCD4', '#8BC34A', '#FFC107',
      '#E91E63', '#009688'
    ];
    return couleurs[idMatiere % couleurs.length];
  }

  getTotalSeances(): number {
    return this.emploiComplet.length;
  }

  getSeancesParJour(jour: string): number {
    return this.emploiParJour[jour]?.length || 0;
  }

  aDesSeances(jour: string): boolean {
    return this.getSeancesParJour(jour) > 0;
  }

  formatHeure(heure: string): string {
    if (!heure) return '';
    return heure.substring(0, 5);
  }

  getJourActuel(): string {
    const aujourdhui = new Date();
    const joursIndex = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return joursIndex[aujourdhui.getDay()];
  }

  estJourActuel(jour: string): boolean {
    return jour === this.getJourActuel();
  }

  getStatistiques() {
    const totalClasses = this.classes.length;
    const totalMatieres = this.matieres.length;
    const totalSeances = this.emploiComplet.length;
    
    const joursAvecCours = this.jours.filter(j => this.aDesSeances(j)).length;
    
    let premiereSeance = '08:00';
    let derniereSeance = '18:00';
    
    if (this.emploiComplet.length > 0) {
      const heures = this.emploiComplet.map(s => s.heure_debut);
      premiereSeance = heures.sort()[0];
      
      const heuresFin = this.emploiComplet.map(s => s.heure_fin);
      derniereSeance = heuresFin.sort().reverse()[0];
    }

    return {
      total_seances: totalSeances,
      total_classes: totalClasses,
      total_matieres: totalMatieres,
      jours_travailles: joursAvecCours,
      premiere_seance: premiereSeance,
      derniere_seance: derniereSeance
    };
  }

  // ========== GESTION DE L'APPEL ==========

  ouvrirAppel(seance: Seance) {
  console.log('🔍 CLIC sur séance:', seance);
  console.log('🆔 id_sceance envoyé:', seance.id_sceance);
  
  this.seanceSelectionnee = seance;
  
  // ✅ CALCULER LA VRAIE DATE de la séance
  const aujourdhui = new Date();
  const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const jourActuelIndex = aujourdhui.getDay();
  const jourSeanceIndex = joursSemaine.indexOf(seance.jour);
  
  // Calculer l'offset pour arriver au bon jour
  let offset = jourSeanceIndex - jourActuelIndex;
  if (offset <= -4) offset += 7;  // Semaine suivante si trop loin en arrière
  
  aujourdhui.setDate(aujourdhui.getDate() + offset);
  this.dateAppel = aujourdhui.toISOString().split('T')[0];
  
  console.log('📅 Date calculée:', this.dateAppel, 'pour jour:', seance.jour);
  
  this.showAppelModal = true;
  this.etudiantsAppel = [];
  this.dejaSaisi = false;
  this.statsAppel = { presents: 0, absents: 0, retards: 0, justifies: 0 };
  this.chargerListeAppel();
}


  fermerAppel() {
    this.showAppelModal = false;
    this.seanceSelectionnee = null;
    this.etudiantsAppel = [];
    this.dejaSaisi = false;
    this.statsAppel = { presents: 0, absents: 0, retards: 0, justifies: 0 };
  }

  chargerListeAppel() {
    if (!this.seanceSelectionnee || !this.dateAppel) return;

    this.loadingAppel = true;
    this.errorMessage = '';

    this.service.getListeAppel(
      this.profId,
      this.seanceSelectionnee.id_sceance,
      this.dateAppel
    ).subscribe({
      next: (data: any) => {
        this.etudiantsAppel = data.etudiants || [];
        this.dejaSaisi = data.deja_saisi || false;
        this.calculerStatsAppel();
        this.loadingAppel = false;
      },
      error: (err) => {
        console.error('Erreur chargement appel:', err);
        this.errorMessage = 'Erreur lors du chargement de la liste des étudiants';
        this.etudiantsAppel = [];
        this.loadingAppel = false;
      }
    });
  }

  changerStatut(etudiant: Etudiant, statut: string) {
    etudiant.statut = statut;
    this.calculerStatsAppel();
  }

  marquerTousPresents() {
    this.etudiantsAppel.forEach(e => e.statut = 'present');
    this.calculerStatsAppel();
  }

  calculerStatsAppel() {
    this.statsAppel = {
      presents: this.etudiantsAppel.filter(e => e.statut === 'present').length,
      absents: this.etudiantsAppel.filter(e => e.statut === 'absent').length,
      retards: this.etudiantsAppel.filter(e => e.statut === 'retard').length,
      justifies: this.etudiantsAppel.filter(e => e.statut === 'justifie').length
    };
  }

  sauvegarderAppel() {
      console.log('🚀 SAUVEGARDE:', {
    seanceId: this.seanceSelectionnee?.id_sceance,
    date: this.dateAppel,
    total: this.etudiantsAppel.length
  });
    if (!this.seanceSelectionnee || !this.dateAppel) return;

    const presences = this.etudiantsAppel.map(e => ({
      id_etudiant: e.id_etudiant,
      statut: e.statut || 'present',
      remarque: e.remarque || null
    }));

    this.savingAppel = true;
    this.errorMessage = '';
    this.messageSucces = '';

    this.service.sauvegarderAppel(
      this.profId,
      this.seanceSelectionnee.id_sceance,
      this.dateAppel,
      presences
    ).subscribe({
      next: (response: any) => {
        this.messageSucces = 'Appel sauvegardé avec succès !';
        this.savingAppel = false;
        
        // Fermer le modal après 1.5 secondes
        setTimeout(() => {
          this.fermerAppel();
          // Effacer le message après 3 secondes
          setTimeout(() => this.messageSucces = '', 3000);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur sauvegarde:', err);
        this.errorMessage = 'Erreur lors de la sauvegarde de l\'appel';
        this.savingAppel = false;
      }
    });
  }
}