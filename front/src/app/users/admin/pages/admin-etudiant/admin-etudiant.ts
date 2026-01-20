import { Component } from '@angular/core';
import { Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminEtudiantService } from '../../services/admin-etudiant-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-etudiant',
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './admin-etudiant.html',
  styleUrl: './admin-etudiant.css',
})
export class AdminEtudiant {
tab: any[] = [];
niveau: any[]= [];
specialite: any[]=[];
object:any={
  nom:'',
  niv:'',
  spec:''
}
constructor(private service:AdminEtudiantService, private route:Router){}

ngOnInit(){
  this.allclasses();
}

voirclasse(id_classe:number){
  this.route.navigate(['/admin/etudiant/classe/',id_classe]);
}

ajoutclass(){
this.service.addclasses(this.object).subscribe({
  next:(id)=>{
    alert("classe ajouté avec succées" +id);
    this.allclasses();
    this.object={
      nom:'',
      niv:'',
      spec:''
    }
  },
  error:(err)=>{
      console.error(err);
      alert("Erreur");
  },
})
}

allclasses(){
  //traja3 classe kol
  this.service.getclasses().subscribe({
    next:(data:any)=>{
      this.tab=data;
      console.log(this.tab);
    },
    error:(err)=>{
        console.error(err);
        alert("Erreur");
    },
  });
  //traja3 les niveaux
  this.service.getniv().subscribe({
      next:(data:any)=>{
      this.niveau=data;
      console.log(this.niveau);
    },
    error:(err)=>{
        console.error(err);
        alert("Erreur");
    },
  });
  //traja3 les specialites
  this.service.getspec().subscribe({
      next:(data:any)=>{
      this.specialite=data;
      console.log(this.specialite);
    },
    error:(err)=>{
        console.error(err);
        alert("Erreur");
    },
  });
}
}
