import { Component } from '@angular/core';
import { EtudiantSidebar } from '../etudiant-sidebar/etudiant-sidebar';
import { CommonModule } from '@angular/common';
import { EtudiantConnexionService, EtudiantNotification } from '../etudiant-connexion-service';

@Component({
  selector: 'app-etudiant-notifications',
  imports: [CommonModule,EtudiantSidebar],
  templateUrl: './etudiant-notifications.html',
  styleUrl: './etudiant-notifications.css',
})
export class EtudiantNotifications {
  notifications: EtudiantNotification[] = [];
  etudiantId!: number;
  showNotifications = true;
  nbNonLues = 0;

  constructor(public service :EtudiantConnexionService){}
  
  ngOnInit() {
    this.etudiantId = this.service.getuserid();  // Votre méthode existante
    this.chargerNotifications();
  }
  
  chargerNotifications() {
    this.service.getNotifications(this.etudiantId).subscribe({
      next: (data:any) => {
        this.notifications = data;
        this.nbNonLues = data.length;
      },
      error: (err:any) => console.error('Erreur notifications:', err)
    });
  }
  
  marquerLu(notif: EtudiantNotification) {
    this.service.marquerNotificationLu(this.etudiantId, notif.id).subscribe({
      next: () => {
        notif.lu = true;
        this.nbNonLues--;
      }
    });
  }
  
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
}
