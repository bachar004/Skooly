import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule,Router } from '@angular/router';
import { AdminConnexion } from '../../services/admin-connexion';
@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule,RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
constructor(public rout:Router, private service : AdminConnexion){};
redirect(){
  this.service.logout();
}
}
