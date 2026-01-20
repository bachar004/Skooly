import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';  // ✅ AJOUTÉ

// ✅ INTERFACES (ajoutez en haut)
export interface ClasseNotif {
  id_classe: number;
  nom_classe: string;
  niveau: string;
  notifications_non_lues: number;
}

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date_creation: string;
  classes_noms: string;
  lu: boolean;
}

export interface NotificationResponse {
  success: boolean;
  id: number;
  classes_envoyees: number;
}
export interface SaisieNote {
  etudiant_id: number;
  nom: string;
  prenom: string;
  matiere_id: number;
  nom_matiere: string;
  coefficient: number;
  note_ds?: number | null;
  note_examen?: number | null;
  moyenne?: number;
  id_note?: number;
}

export interface NoteEtudiant {
  id_note: number;
  etudiant_id: number;
  matiere_id: number;
  nom_matiere: string;
  coefficient: number;
  note_ds: number | null;
  note_examen: number | null;
  moyenne: number;
  semestre: string;
  annee_scolaire: string;
  nom_classe: string;
}

@Injectable({
  providedIn: 'root',
})
export class Profservice {
  private selectedSeanceId: number | null = null;

  private url = "http://localhost:3000/api/prof/login";
  private baseUrl = "http://localhost:3000/api";  // ✅ BASE URL

  constructor(public http: HttpClient, private router: Router) {}

  // ... VOS MÉTHODES EXISTANTES (INCHANGÉES) ...
  login(mail: string, mdp: string) {
    return this.http.post(this.url, { mail, mdp });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login/prof']); 
  }

  public isloggedin() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    else return true;
  }

  getuserid(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.id || 0;
    } catch {
      return 0;
    }
  }

  getEmploiDuTemps(profId: number) {
    return this.http.get(`${this.baseUrl}/prof/${profId}/emploi`);
  }

  getMesClasses(profId: number) {
    return this.http.get(`${this.baseUrl}/prof/${profId}/classes`);
  }

  getMesMatieres(profId: number) {
    return this.http.get(`${this.baseUrl}/prof/${profId}/matieres`);
  }

  getListeAppel(profId: number, seanceId: number, date: string) {
    return this.http.get(`${this.baseUrl}/prof/${profId}/appel/${seanceId}/${date}`);
  }

  sauvegarderAppel(profId: number, seanceId: number, date: string, presences: any[]) {
    const body = { seanceId, date, presences };
    return this.http.post(`${this.baseUrl}/prof/${profId}/appel/sauvegarder`, body);
  }

  getHistoriquePresences(profId: number, classeId: number, dateDebut?: string, dateFin?: string) {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get(`${this.baseUrl}/prof/${profId}/historique-presences/${classeId}`, { params });
  }

  getStatistiquesEtudiant(profId: number, etudiantId: number) {
    return this.http.get(`${this.baseUrl}/prof/${profId}/statistiques-etudiant/${etudiantId}`);
  }

  // ✅ NOTIFICATIONS CORRIGÉES
  getClassesNotifications(profId: number): Observable<ClasseNotif[]> {
    return this.http.get<ClasseNotif[]>(`${this.baseUrl}/prof/${profId}/classes-notifications`);
  }

  getNotifications(profId: number, lu: string = 'toutes'): Observable<Notification[]> {
    let params = new HttpParams();
    if (lu && lu !== 'toutes') {
      params = params.set('lu', lu);
    }
    return this.http.get<Notification[]>(`${this.baseUrl}/prof/${profId}/notifications`, { params });
  }

  envoyerNotification(profId: number, data: any): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(`${this.baseUrl}/prof/${profId}/notifications/envoyer`, data);
  }

  marquerLu(profId: number, notifId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/prof/${profId}/notifications/${notifId}/lu`, {});
  }

  getClassesSaisieNotes(profId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/prof/${profId}/classes-saisie-notes`);
}

sauvegarderNotes(profId: number, data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/prof/${profId}/notes/sauvegarder`, data);
}

// ✅ NOUVELLES méthodes
getMatieresClasse(profId: number, classeId: number, semestre: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/prof/${profId}/matieres-classe/${classeId}/${semestre}`);
}

getSaisieNotes(profId: number, classeId: number, semestre: string, matiereId: number): Observable<SaisieNote[]> {
  return this.http.get<SaisieNote[]>(`${this.baseUrl}/prof/${profId}/saisie-notes/${classeId}/${semestre}/${matiereId}`);
}


}
