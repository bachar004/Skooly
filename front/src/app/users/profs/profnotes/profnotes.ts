import { Component } from '@angular/core';
import { Profsidebar } from '../profsidebar/profsidebar';
import { Profservice, SaisieNote } from '../profservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profnotes',
  imports: [Profsidebar,CommonModule,FormsModule],
  templateUrl: './profnotes.html',
  styleUrl: './profnotes.css',
})
export class Profnotes {
      profId!: number;
  classes: any[] = [];
  classeId!: number;
  semestre: 'S1' | 'S2' = 'S1';
  matieres: any[] = [];
  matiereId?: number;
  
  // Données notes
  notes: SaisieNote[] = [];
  loading = false;
  saving = false;

  constructor(private service: Profservice) {}

  ngOnInit(): void {
    this.profId = this.service.getuserid();
    console.log('🔍 Prof ID:', this.profId);
    this.chargerClasses();
  }

  // 1. Charger les classes du prof
  chargerClasses(): void {
    this.service.getClassesSaisieNotes(this.profId).subscribe({
      next: (data) => {
        console.log('✅ Classes:', data);
        this.classes = data || [];
        if (this.classes.length > 0) {
          this.classeId = this.classes[0].id_classe;
          this.chargerMatieres();
        }
      },
      error: (err) => {
        console.error('❌ Erreur classes:', err);
        this.classes = [];
      }
    });
  }

  // 2. Charger les matières (SES matières seulement)
  chargerMatieres(): void {
    if (!this.classeId || !this.semestre) {
      this.matieres = [];
      return;
    }

    this.loading = true;
    this.service.getMatieresClasse(this.profId, this.classeId, this.semestre).subscribe({
      next: (data) => {
        console.log('✅ Matières:', data);
        this.matieres = data || [];
        if (this.matieres.length > 0) {
          this.matiereId = data[0].id_matiere;
          this.chargerNotes();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur matières:', err);
        this.matieres = [];
        this.loading = false;
      }
    });
  }

  // 3. Charger les notes pour 1 matière
  chargerNotes(): void {
    if (!this.classeId || !this.matiereId) {
      this.notes = [];
      return;
    }

    this.loading = true;
    this.service.getSaisieNotes(this.profId, this.classeId, this.semestre, this.matiereId).subscribe({
      next: (data) => {
        console.log('✅ Notes reçues:', data.length, 'étudiants');
        this.notes = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur notes:', err);
        this.notes = [];
        this.loading = false;
      }
    });
  }

  // Événements selects
  changerClasse(): void {
    console.log('👉 Changement classe:', this.classeId);
    this.matiereId = undefined;
    this.matieres = [];
    this.notes = [];
    this.chargerMatieres();
  }

  changerSemestre(): void {
    console.log('👉 Changement semestre:', this.semestre);
    this.matiereId = undefined;
    this.matieres = [];
    this.notes = [];
    this.chargerMatieres();
  }

  changerMatiere(): void {
    console.log('👉 Changement matière:', this.matiereId);
    this.chargerNotes();
  }

  // Calcul moyenne (30% DS + 70% Examen)
  calculerMoyenne(note: SaisieNote): number {
    const ds = note.note_ds || 0;
    const examen = note.note_examen || 0;
    return (ds * 0.3 + examen * 0.7);
  }

  // Sauvegarder TOUTES les notes de la matière
  sauvegarderNotes(): void {
  if (!this.matiereId || !this.classeId) {
    alert('Veuillez sélectionner une classe et une matière.');
    return;
  }

  if (this.notes.length === 0) {
    alert('Aucune note à sauvegarder.');
    return;
  }

  // ✅ Validation des valeurs
  const erreurs: string[] = [];

  this.notes.forEach((n, index) => {
    const ligne = index + 1;
    const nom = `${n.prenom} ${n.nom}`;

    const ds = n.note_ds;
    const ex = n.note_examen;

    // Autoriser vide (null/undefined), mais si rempli → 0–20
    if (ds != null && (ds < 0 || ds > 20)) {
      erreurs.push(`DS invalide pour ${nom} (ligne ${ligne}) : ${ds}`);
    }
    if (ex != null && (ex < 0 || ex > 20)) {
      erreurs.push(`Examen invalide pour ${nom} (ligne ${ligne}) : ${ex}`);
    }
  });

  if (erreurs.length > 0) {
    alert(
      'Certaines notes sont invalides (doivent être entre 0 et 20).\n\n' +
      erreurs.slice(0, 5).join('\n') + 
      (erreurs.length > 5 ? `\n... +${erreurs.length - 5} autres erreurs` : '')
    );
    return; // ⛔ bloque l’envoi
  }

  this.saving = true;

  const notesToSave = this.notes
    .map(n => ({
      etudiant_id: n.etudiant_id,
      matiere_id: n.matiere_id,
      note_ds: n.note_ds ?? null,
      note_examen: n.note_examen ?? null
    }))
    .filter(n => n.note_ds !== null || n.note_examen !== null);

  this.service.sauvegarderNotes(this.profId, {
    notes: notesToSave,
    classeId: this.classeId,
    semestre: this.semestre,
    matiereId: this.matiereId
  }).subscribe({
    next: (res) => {
      alert(`✅ ${res.notesSauvees} notes sauvegardées.`);
      this.saving = false;
      this.chargerNotes();
    },
    error: (err) => {
      console.error(err);
      alert('Erreur lors de la sauvegarde.');
      this.saving = false;
    }
  });
}


  // Utilitaire : Nom matière actuelle
  getNomMatiereActuelle(): string {
    const matiere = this.matieres.find(m => m.id_matiere === this.matiereId);
    return matiere ? matiere.nom_matiere : 'Sélectionnez une matière';
  }

  getNomClasseActuelle(): string {
  const classe = this.classes.find(c => c.id_classe === this.classeId);
  return classe?.nom_classe || 'Classe inconnue';
}
}
