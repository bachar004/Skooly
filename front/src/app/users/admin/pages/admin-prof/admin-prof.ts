import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminProfService } from '../../services/admin-prof-service';
import { AdminEtudiantService } from '../../services/admin-etudiant-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-prof',
  imports: [RouterModule,AdminSidebar,CommonModule,FormsModule],
  standalone:true,
  templateUrl: './admin-prof.html',
  styleUrl: './admin-prof.css',
  providers:[DatePipe]
})
export class AdminProf {
  msg=null;
  prof_id:number=-1;
  allprof:any[]=[];
  prof:any={
    nom:'',
    prenom:'',
    ddn:'',
    cin:'',
    mail:'',
    mdp:''
  };
  text="";
  edit_prof:any={
    id:null,
    nom:null,
    prenom:null,
    ddn:null,
    mail:null,
    cin:null,
}
  ngOnInit(){
    this.getallprof();
  }
  constructor(private service:AdminProfService, private etudiant:AdminEtudiantService,private date:DatePipe){}
  getallprof(){
    this.service.getall().subscribe({
      next:(data:any)=>{
          this.allprof=data;
          console.log(this.allprof);
      },
      error:(err)=>{
          console.error(err);
      }
    })
  }
  getprofbych(ch:String){
    this.msg=null;
    this.service.getrecherche(ch).subscribe({
      next:(data:any)=>{
        this.allprof=data;
        console.log(this.allprof);
      },
      error:(err)=>{
          console.error(err);
          this.msg= err.message;
      },
    })
  }
  search(event: any) {
    const value = event.target.value;
    if(value.length >= 1) { 
      this.getprofbych(value);
    } else {
      this.getallprof();
    }
  }
  genmdp(){
    this.etudiant.mdp().subscribe({
      next:(value:any)=>{
          this.prof.mdp=value.mdp;
      },error:(err)=>{
          console.error(err);
      },
    })
  }
  ajout(){
    this.service.addprof(this.prof).subscribe({
      next:(value:any)=> {
          console.log(value);
          this.prof={
            nom:'',
            prenom:'',
            ddn:'',
            cin:'',
            mail:'',
            mdp:''
          };
          document.getElementById("close")?.click();
          alert("prof ajouté avec succées");
      },
      error:(err)=>{
          console.error(err);
      },
    })
  }
getprof(data:any){
  this.prof_id=data.id;
  this.edit_prof.id=data.id;
  const date_format=this.date.transform(data.ddn,'yyyy-MM-dd')
  this.edit_prof.nom=data.nom;
  this.edit_prof.prenom=data.prenom;
  this.edit_prof.mail=data.mail;
  this.edit_prof.ddn=date_format;
  this.edit_prof.cin=data.cin;
}
  majprof(){
    this.service.majprof(this.prof_id,this.edit_prof).subscribe({
      next:(value:any)=>{
          this.edit_prof={
            id:null,
            nom:null,
            prenom:null,
            ddn:null,
            mail:null,
            cin:null,
          };
          document.getElementById("sakker")?.click();
      alert("prof modifié");
      this.getallprof();
      },error:(err)=>{
          console.error(err);
      }
    })
  }
  exist(){
    this.service.sceance_exist(this.prof_id).subscribe({
      next:(value:any)=>{
          if (value[0].nbsceance!=0){
            alert("Ce prof a des sceances vous ne pouvez pas le supprimer");
            document.getElementById("fermer")?.click();
          }
          else{
              this.service.deleteprof(this.prof_id).subscribe({
                next:(value)=>{
                    alert("Ce prof a été supprimé avec succées");
                    this.edit_prof={
                    id:null,
                    nom:null,
                    prenom:null,
                    date_naissance:null,
                    mail:null,
                    cin:null,
                  };
                    document.getElementById("fermer")?.click();
                        if(this.text.length >= 2) { 
                          this.getprofbych(this.text);
                        }
                        else {
                          this.getallprof();
                        }
                },error:(err)=>{
                console.error(err);
                }
              })
          }
      },error:(err)=>{
          console.error(err);
      }
    });
  }

}
