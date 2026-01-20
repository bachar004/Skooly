import { Component } from '@angular/core';
import { AdminEtudiantService } from '../../services/admin-etudiant-service';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute} from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-classes',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-classes.html',
  styleUrl: './admin-classes.css',
  providers: [DatePipe]
})
export class AdminClasses {
data:any={
    nom:"",
    prenom:"",
    date_naissance:"",
    mail:"",
    mdp:"",
    etudiant_id:"",
    classe_id:null,
    annee_scolaire:""
}
classes: any[]=[];
tab_etudiant:any[]=[];
emploi:any[]=[];

etud_id:any=null;

edit_etud:any={
    id:null,
    nom:null,
    prenom:null,
    date_naissance:null,
    mail:null,
}
constructor(private service : AdminEtudiantService, private route:ActivatedRoute, private date:DatePipe){}
ngOnInit(){
  return this.etud();
}

etud(){
  //chtekhou parametre id mel url traja3 tableau etudiant
  const id = Number(this.route.snapshot.paramMap.get('id'));
  this.service.getetudiant(id).subscribe({
    next:(data:any)=>{
      this.tab_etudiant=data;
      console.log(this.tab_etudiant);
    },
    error(err) {
        console.error(err);
        alert("erreur");
    },
  });
  // traja3 classet
  this.service.getclasses().subscribe({
    next:(data:any)=>{
      this.classes=data;
      console.log(this.classes);
    },
    error(err) {
        console.error(err);
        alert("erreur");
    },
  });
  //traja3 sceances mta3 emploi
  const idemploi = Number(this.route.snapshot.paramMap.get('id'));
  this.service.getemploi(idemploi).subscribe({
    next:(data:any)=>{
      this.emploi=data;
      console.log(this.emploi);
    },
    error(err) {
        console.error(err);
        alert("erreur");
    },
  });
}

sceance(jour:String,deb:String){
  for (let sc of this.emploi){
    if(sc.jour===jour && sc.heure_debut===deb){
      return sc;
    }
  }
}
//generi mdp auto
genmdp(){
  this.service.mdp().subscribe({
    next:(pwd:any)=>{
        this.data.mdp=pwd.mdp;
      },
    error:(err)=>{
        console.error(err);
        alert("erreur");
    },
  })
}
ajout_etudiant_inscri(){
    this.data.classe_id=Number(this.route.snapshot.paramMap.get('id'));
    this.service.add_etud_inscri(this.data).subscribe({
      next:(ids:any)=>{
        console.log(ids.etud+"/"+ids.inscr);
        this.data={
          nom:"",
          prenom:"",
          date_naissance:"",
          mail:"",
          mdp:"",
          etudiant_id:"",
          classe_id:null,
          annee_scolaire:""
        };
        alert("Ajout d'etudiant avec Succées");
        document.getElementById('close')?.click(); 
        this.etud();
      },
      error:(err)=>{
        console.error(err);
        alert("erreur");
      }
    })
}
getdeleteid(id:number){
  this.etud_id=id;
}
delete_inscri_etud(){
  const classe_id = Number(this.route.snapshot.paramMap.get('id'));
  this.service.deleteinscrietud(this.etud_id,classe_id).subscribe({
    next:(value)=>{
        alert("Etudiant supprimé");
        this.etud_id=null;
        document.getElementById('fermer')?.click(); 
        this.etud()
    },
    error:(err)=>{
        console.error(err);
        alert("erreur");
    },
  })
}
getetud(data:any){
  const date_format=this.date.transform(data.date_naissance,'yyyy-MM-dd')
  this.edit_etud.id=data.id;
  this.edit_etud.nom=data.nom;
  this.edit_etud.prenom=data.prenom;
  this.edit_etud.mail=data.mail;
  this.edit_etud.date_naissance=date_format;
}
majetud(){
  this.service.majetud(this.edit_etud).subscribe({
    next:(msg:any)=>{
        alert(msg.message);
        this.edit_etud={
            id:null,
            nom:null,
            prenom:null,
            date_naissance:null,
            mail:null,
        }
        document.getElementById("sakker")?.click();
        this.etud
    },
    error:(err)=>{
        console.error(err);
        alert("erreur");
    },
  })
}
}
