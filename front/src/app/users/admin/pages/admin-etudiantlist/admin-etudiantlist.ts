import { Component } from '@angular/core';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-etudiantlist',
  imports: [AdminSidebar,RouterOutlet],
  templateUrl: './admin-etudiantlist.html',
  styleUrl: './admin-etudiantlist.css',
})
export class AdminEtudiantlist {

}
