import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';


export interface EtudiantNotification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date_creation: string;
  classes_noms: string;
  prof_nom: string;
  lu: boolean;
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
  semestre_matiere?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EtudiantConnexionService {
  private url="http://localhost:3000/api/etudiant/login"
  private urlacceuil="http://localhost:3000/api/etudiant/cart"
  private urlemploi="http://localhost:3000/api/etudiant/emploi"
  private urlcours="http://localhost:3000/api/etudiant/cours"
  private api = 'http://localhost:3000/api/etudiant/abscence';
  private api2 = 'http://localhost:3000/api/etudiant/presences';
  private baseUrl="http://localhost:3000/api"
  constructor(private http: HttpClient, private router: Router) {}

  login(mail: string, mdp: string) {
    return this.http.post(this.url, { mail, mdp });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login/etudiant']); 
  }

  public isloggedin(){
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    else return true;
  }
  getuserid() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  }
  public cartetudiant(id:number){
    return this.http.get(this.urlacceuil+"/"+id)
  }
  public emploi(id:number){
    return this.http.get(this.urlemploi+"/"+id)
  }
  public cours(id:number){
    return this.http.get(this.urlcours+"/"+id)
  }
  getAbsenceParJour(etudiantId: number, date: string) {
    let params = new HttpParams()
      .set("etudiantId", etudiantId.toString())
      .set("date", date);

    return this.http.get(this.api, { params });
  }
  getPresencesParJour(etudiantId: number, date: string){
    const params = new HttpParams()
      .set('etudiantId', etudiantId.toString())
      .set('date', date);
    
    return this.http.get(this.api2, { params });
  }
  getNotifications(etudiantId: number): Observable<EtudiantNotification[]> {
  return this.http.get<EtudiantNotification[]>(`${this.baseUrl}/etudiant/${etudiantId}/notifications`);
}

marquerNotificationLu(etudiantId: number, notifId: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/etudiant/${etudiantId}/notifications/${notifId}/lu`, {});
}


getMesNotes(etudiantId: number): Observable<NoteEtudiant[]> {
  return this.http.get<NoteEtudiant[]>(`${this.baseUrl}/etudiant/${etudiantId}/notes`);
}

}
