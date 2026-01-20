import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminAcceuilService {
  private url1 = 'http://localhost:3000/api/admin/acceuil_stats';
  private url2 = 'http://localhost:3000/api/admin/peretud';

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get(this.url1);
  }
  getpercent(){
    return this.http.get(this.url2);
  }
}
