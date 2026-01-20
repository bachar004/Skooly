import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EtudiantSidebar } from '../etudiant-sidebar/etudiant-sidebar';
import { EtudiantConnexionService } from '../etudiant-connexion-service';

@Component({
  selector: 'app-etudiant-acceuil',
  imports: [CommonModule,EtudiantSidebar],
  templateUrl: './etudiant-acceuil.html',
  styleUrl: './etudiant-acceuil.css',
})
export class EtudiantAcceuil {
  etudiant:any={
    nom:"",
    prenom:"",
    id_classe:"",
    date_naissance:"",
    nom_classe:"",
    anne_scolaire:""
  }
  emploi:any[]=[];
  constructor(private service:EtudiantConnexionService){}
  ngOnInit(){
    this.cart();
  }
  cart(){
    let userid=this.service.getuserid()
    this.service.cartetudiant(userid).subscribe({
      next:(data:any) =>{
          this.etudiant=data;
          console.log(this.etudiant);
          this.emp();
      },
      error(err){
          console.log(err.message);
      },
    })
  }
  emp(){
  this.service.emploi(this.etudiant.id_classe).subscribe({
    next:(data:any)=>{
      this.emploi=data;
      console.log(data);
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
}
