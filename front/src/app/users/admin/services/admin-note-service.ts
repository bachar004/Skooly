import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminNoteService {
  constructor(private http: HttpClient){}
    private apiUrl = 'http://localhost:3000/api/admin';
getClassesAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classes-admin`);
  }

  // Récupérer toutes les notes d’une classe pour un semestre
  getNotesClasse(classeId: number, semestre: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/notes-classe/${classeId}/${semestre}`
    );
  }

  // Optionnel : récupérer le détail d’un étudiant
  getNotesEtudiant(etudiantId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/notes-etudiant/${etudiantId}`
    );
  }
}
