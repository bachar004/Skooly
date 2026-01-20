import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminEtudiantService {
  url1="http://localhost:3000/api/admin/classes";
  url2="http://localhost:3000/api/admin/classes/niv";
  url3="http://localhost:3000/api/admin/classes/spec";
  url4="http://localhost:3000/api/admin/classes/etudiants";
  url5="http://localhost:3000/api/admin/classes/emploi"
  urlmdp="http://localhost:3000/api/admin/generatepwd";
  urlajout="http://localhost:3000/api/admin/classes/addetud";
  urldelete="http://localhost:3000/api/admin/classes/delete";
  urlmajetud="http://localhost:3000/api/admin/classes/majetud"

  constructor(private http:HttpClient){}

  getclasses(){
    return this.http.get(this.url1);
  };
  addclasses(object :any){
    return this.http.post(this.url1,object);
  };
  getniv(){
    return this.http.get(this.url2);
  };
  getspec(){
    return this.http.get(this.url3);
  };
  getetudiant(id:number){
    return this.http.get(this.url4 + '/' +id);
  };
  getemploi(id:number){
    return this.http.get(this.url5+'/'+id);
  };
  mdp(){
    return this.http.get(this.urlmdp);
  };
  add_etud_inscri(data:any){
    return this.http.post(this.urlajout,data);
  }
  deleteinscrietud(id_etud:number,id_classe:number){
    return this.http.delete(this.urldelete+"/"+id_etud+"/"+id_classe);
  }
  majetud(data:any){
    return this.http.put(this.urlmajetud+"/"+data.id,data);
  }
}
