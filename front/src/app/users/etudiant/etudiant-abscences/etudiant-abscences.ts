import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EtudiantSidebar } from '../etudiant-sidebar/etudiant-sidebar';
import { EtudiantConnexionService } from '../etudiant-connexion-service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

interface Presence {
  id_presence?: number;
  sceance_id: number;
  date_sceance: string;
  id_sceance: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  salle: string;
  nom_matiere: string;
  prof_nom: string;
  prof_prenom: string;
  statut: 'present' | 'absent' | 'retard' | 'justifie';
  remarque?: string;
}

interface Seance {
  id_sceance: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  salle: string;
  prof: string;
  prof_prenom?: string;
  nom_matiere: string;
}

interface CarteEtudiant {
  nom: string;
  prenom: string;
  date_naissance: string;
  nom_classe: string;
  id_classe: number;
}

@Component({
  selector: 'app-etudiant-abscences',
  imports: [CommonModule, EtudiantSidebar, FormsModule],
  templateUrl: './etudiant-abscences.html',
  styleUrl: './etudiant-abscences.css',
})
export class EtudiantAbscences implements OnInit {
  selectedDate: string = '';
  etudiantId!: number;
  classeId!: number;
  carteEtudiant?: CarteEtudiant;

  emploiJour: Seance[] = [];
  presences: Presence[] = [];  // Toutes les présences (présent, absent, retard, etc.)
  
  isLoading: boolean = false;
  errorMessage: string = '';
  
  constructor(private service: EtudiantConnexionService) {}

  // Normalise une heure au format HH:MM (enlève les secondes)
  private normalizeTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  // Charge les données pour la date sélectionnée
  chercherAbsence() {
    if (!this.selectedDate) {
      this.errorMessage = 'Veuillez sélectionner une date valide';
      return;
    }

    if (!this.classeId) {
      this.errorMessage = 'Classe non trouvée. Veuillez recharger la page.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Étudiant ID:', this.etudiantId);
    console.log('Classe ID:', this.classeId);
    console.log('Date sélectionnée:', this.selectedDate);
    console.log('Jour:', this.formatJour(this.selectedDate));

    // Charger présences et emploi en parallèle
    forkJoin({
      presences: this.service.getPresencesParJour(this.etudiantId, this.selectedDate),
      emploi: this.service.emploi(this.classeId)
    }).subscribe({
      next: (data: any) => {
        console.log('Réponse présences:', data.presences);
        console.log('Réponse emploi:', data.emploi);
        
        // Toutes les présences (tous statuts confondus)
        this.presences = Array.isArray(data.presences) ? data.presences : [];
        console.log('Nombre de présences enregistrées:', this.presences.length);

        // Filtrer l'emploi pour le jour de la semaine
        const jour = this.formatJour(this.selectedDate);
        console.log('Filtrage emploi pour le jour:', jour);
        
        this.emploiJour = (Array.isArray(data.emploi) ? data.emploi : []).filter((s: Seance) => {
          const match = s.jour && s.jour.toLowerCase() === jour.toLowerCase();
          return match;
        });

        console.log('Nombre de séances pour ce jour:', this.emploiJour.length);

        // Trier les séances par heure de début
        this.emploiJour.sort((a, b) => 
          a.heure_debut.localeCompare(b.heure_debut)
        );
        
        // Afficher le résumé
        this.emploiJour.forEach(seance => {
          const statut = this.getStatutSeance(seance);
          console.log(`${seance.nom_matiere} (${seance.heure_debut}-${seance.heure_fin}): ${statut}`);
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('=== ERREUR ===', err);
        this.errorMessage = 'Erreur lors du chargement des données. Veuillez réessayer.';
        this.presences = [];
        this.emploiJour = [];
        this.isLoading = false;
      }
    });
  }

  // Vérifie si la date sélectionnée est dans le futur
  estDateFuture(): boolean {
    if (!this.selectedDate) return false;
    const dateSelectionnee = new Date(this.selectedDate + 'T00:00:00');
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    return dateSelectionnee > aujourdhui;
  }

  // Obtient le statut d'une séance (présent, absent, retard, justifié, ou non marqué)
  getStatutSeance(seance: Seance): string {
    if (!seance) return 'non_marque';
     console.log(`🔍 ${seance.nom_matiere}: id_sceance=${seance.id_sceance}`);
    // Si c'est une date future, le statut n'est pas encore déterminé
    if (this.estDateFuture()) {
      return 'futur';
    }
    
    // Chercher la présence correspondante
    const presence = this.presences.find(p => {
      // Vérifier d'abord par ID (le plus fiable)
      const matchId = p.sceance_id === seance.id_sceance || p.id_sceance === seance.id_sceance;
      
      if (matchId) return true;
      
      // Fallback : vérifier par horaire + salle + jour
      const heureDebutSeance = this.normalizeTime(seance.heure_debut);
      const heureFinSeance = this.normalizeTime(seance.heure_fin);
      const heureDebutPresence = this.normalizeTime(p.heure_debut);
      const heureFinPresence = this.normalizeTime(p.heure_fin);
      
      const memeHoraire = heureDebutPresence === heureDebutSeance && 
                          heureFinPresence === heureFinSeance;
      const memeSalle = p.salle === seance.salle;
      const memeJour = p.jour?.toLowerCase() === seance.jour?.toLowerCase();
      
      return memeHoraire && memeSalle && memeJour;
    });
    
    // Si une présence est trouvée, retourner son statut
    if (presence) {
      return presence.statut;
    }
    
    // Sinon, c'est non marqué
    return 'non_marque';
  }

  // Vérifie si l'étudiant est absent
  estAbsent(seance: Seance): boolean {
    return this.getStatutSeance(seance) === 'absent';
  }

  // Vérifie si l'étudiant est présent
  estPresent(seance: Seance): boolean {
    return this.getStatutSeance(seance) === 'present';
  }

  // Vérifie si l'étudiant est en retard
  estEnRetard(seance: Seance): boolean {
    return this.getStatutSeance(seance) === 'retard';
  }

  // Vérifie si l'absence est justifiée
  estJustifie(seance: Seance): boolean {
    return this.getStatutSeance(seance) === 'justifie';
  }

  // Vérifie si le statut n'est pas encore marqué
  estNonMarque(seance: Seance): boolean {
    return this.getStatutSeance(seance) === 'non_marque';
  }

  // Formate la date en jour de la semaine
  formatJour(dateStr: string): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  }

  // Formate la date en format lisible
  formatDateLisible(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  // Formate l'heure pour l'affichage
  formatHeure(heure: string): string {
    if (!heure) return '';
    return heure.substring(0, 5);
  }

  // Calcule le nombre total d'absences pour le jour
  getTotalAbsences(): number {
    if (this.estDateFuture()) return 0;
    return this.presences.filter(p => p.statut === 'absent').length;
  }

  // Calcule le nombre de présences pour le jour
  getTotalPresences(): number {
    if (this.estDateFuture()) return 0;
    return this.presences.filter(p => p.statut === 'present').length;
  }

  // Calcule le nombre de retards pour le jour
  getTotalRetards(): number {
    if (this.estDateFuture()) return 0;
    return this.presences.filter(p => p.statut === 'retard').length;
  }

  // Calcule le taux de présence pour le jour
  getTauxPresence(): number {
    if (this.emploiJour.length === 0) return 100;
    if (this.estDateFuture()) return 0;
    const presents = this.presences.filter(p => p.statut === 'present' || p.statut === 'retard').length;
    return Math.round((presents / this.emploiJour.length) * 100);
  }

  // Sélectionne aujourd'hui
  selectAujourdhui() {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.chercherAbsence();
  }

  // Sélectionne hier
  selectHier() {
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    this.selectedDate = hier.toISOString().split('T')[0];
    this.chercherAbsence();
  }

  ngOnInit() {
    console.log('=== INITIALISATION ===');
    
    this.etudiantId = this.service.getuserid();
    console.log('Étudiant ID récupéré:', this.etudiantId);
    
    if (!this.etudiantId) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      this.isLoading = false;
      return;
    }

    this.selectedDate = new Date().toISOString().split('T')[0];
    console.log('Date par défaut:', this.selectedDate);

    this.isLoading = true;
    
    this.service.cartetudiant(this.etudiantId).subscribe({
      next: (carte: any) => {
        console.log('Carte étudiant reçue:', carte);
        
        this.carteEtudiant = carte as CarteEtudiant;
        this.classeId = carte.id_classe;
        
        console.log('Classe ID:', this.classeId);
        
        // Charger les données initiales
        this.chercherAbsence();
      },
      error: (err: any) => {
        console.error('Erreur carte étudiant:', err);
        this.errorMessage = 'Impossible de charger vos informations. Veuillez vous reconnecter.';
        this.isLoading = false;
      }
    });
  }
}