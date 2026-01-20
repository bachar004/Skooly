import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminProfService {
  urlall="http://localhost:3000/api/admin/prof";
  urladd="http://localhost:3000/api/admin/prof/add";
  urlprofid="http://localhost:3000/api/admin/profbyid";
  urlput="http://localhost:3000/api/admin/prof/majprof";
  urlexist="http://localhost:3000/api/admin/prof/sceance";
  urldelete="http://localhost:3000/api/admin/prof/delete"

  constructor(private http:HttpClient){}
  getall(){
    return this.http.get(this.urlall);
  }
  getrecherche(chaine :String){
    return this.http.get(this.urlall+'/'+chaine);
  }
  addprof(data:any){
    return this.http.post(this.urladd,data);
  }
  getprof(id:number){
    return this.http.get(this.urlprofid+'/'+id);
  }
  majprof(id:number,data:any){
    return this.http.put(this.urlput+'/'+id,data);
  }
  sceance_exist(id:number){
    return this.http.get(this.urlexist+'/'+id);
  }
  deleteprof(id:number){
    return this.http.delete(this.urldelete+'/'+id);
  }
}
