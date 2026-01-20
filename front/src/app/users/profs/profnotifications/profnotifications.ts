import { Component, OnInit } from '@angular/core';
import { Profsidebar } from '../profsidebar/profsidebar';
import { NotificationResponse, Profservice } from '../profservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date_creation: string;
  classes_noms?: string;  // Backend renvoie ça
  classes?: string;       // Fallback
  lu: boolean;
}

interface ClasseNotif {
  id_classe: number;
  nom_classe: string;
  niveau: string;
  notifications_non_lues: number;
}


@Component({
  selector: 'app-profnotifications',
  imports: [Profsidebar,CommonModule,FormsModule],
  templateUrl: './profnotifications.html',
  styleUrl: './profnotifications.css',
})
export class Profnotifications implements OnInit{
profId!: number;
  
  classes: ClasseNotif[] = [];
  notifications: Notification[] = [];
  classesSelectionnees: number[] = [];
  
  showForm = false;
  titre = '';
  message = '';
  type: 'info' | 'warning' | 'success' | 'error' = 'info';
  
  loading = false;
  envoiLoading = false;
  
  constructor(private service: Profservice) {}
  
  ngOnInit() {
    this.profId = this.service.getuserid();
    console.log('🔍 Prof ID:', this.profId);
    this.chargerClasses();
    this.chargerNotifications();
  }
  
  chargerClasses() {
    console.log('📥 Chargement classes...');
    this.service.getClassesNotifications(this.profId).subscribe({
      next: (data) => {
        console.log('✅ Classes reçues:', data);
        this.classes = data || [];
      },
      error: (err) => {
        console.error('❌ Erreur classes:', err);
        this.classes = [];
      }
    });
  }
  
  chargerNotifications(lu: string = 'toutes') {
    this.service.getNotifications(this.profId, lu).subscribe({
      next: (data : any) => this.notifications = data,
      error: (err) => console.error(err)
    });
  }
  
  onFilterChange(event: any) {
    const value = (event.target as HTMLSelectElement).value;
    this.chargerNotifications(value);
  }
  
  toggleClasse(id_classe: number) {
    const index = this.classesSelectionnees.indexOf(id_classe);
    if (index > -1) {
      this.classesSelectionnees.splice(index, 1);
    } else {
      this.classesSelectionnees.push(id_classe);
    }
  }
  
  estSelectionnee(id_classe: number): boolean {
    return this.classesSelectionnees.includes(id_classe);
  }
  
  envoyerNotification() {
    if (!this.titre || !this.message || this.classesSelectionnees.length === 0) {
      alert('Veuillez remplir tous les champs et sélectionner au moins une classe');
      return;
    }
    
    this.envoiLoading = true;
    this.service.envoyerNotification(this.profId, {
      titre: this.titre,
      message: this.message,
      type: this.type,
      classes: this.classesSelectionnees
    }).subscribe({
      next: (response: NotificationResponse) => {
        alert(`✅ Notification envoyée à ${response.classes_envoyees} classe(s) !`);
        this.resetForm();
        this.chargerNotifications();
      },
      error: (err) => alert('Erreur: ' + (err.error?.error || err.message)),
      complete: () => this.envoiLoading = false
    });
  }
  
  resetForm() {
    this.titre = '';
    this.message = '';
    this.classesSelectionnees = [];
    this.type = 'info';
  }
  
  marquerLu(notif: Notification) {
    this.service.marquerLu(this.profId, notif.id).subscribe({
      next: () => notif.lu = true
    });
  }
  
  getTypeClass(type: string): string {
    return `bg-${type} text-white`;
  }
}
