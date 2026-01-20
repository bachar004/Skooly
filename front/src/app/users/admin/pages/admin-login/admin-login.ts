import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AdminConnexion } from '../../services/admin-connexion';

declare var bootstrap: any;
@Component({
  selector: 'app-admin-login',
  standalone:true,
  imports: [FormsModule,CommonModule,RouterModule,HttpClientModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  loading=false
  mail : string ='';
  mdp : string ='';
  otp: string ='';
constructor(private adminconn : AdminConnexion, private router : Router){ };
login(){
  if(this.loading) return;
  this.loading=true;
    this.adminconn.login(this.mail, this.mdp).subscribe({
      next: (res: any) => {
        console.log(res.message)
        alert(res.message);
        setTimeout(()=>{
          const modal = new bootstrap.Modal(document.getElementById('otpmodal'));
          modal.show();
        },0)
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur', err);
        alert(err.error.message);
        this.loading = false;
      },
    });
  }
  verifyotp(){
      this.adminconn.verifotp(this.mail,this.otp).subscribe({
        next: (res: any) => {
            localStorage.setItem('token', res.token);
            this.router.navigate(['/admin/acceuil']);
            document.getElementById("sakker")?.click()
        },error: (err) => {
          console.error('Erreur', err);
          alert(err.error.message);
        }
    })
  }
  resendotp(){
      this.adminconn.login(this.mail,this.mdp).subscribe({
        next: (res: any) => {
          alert("Otp renvoyé");
        },
        error: (err) => {
          console.error('Erreur', err);
          alert(err.error.message);
        },
    })
  }
}