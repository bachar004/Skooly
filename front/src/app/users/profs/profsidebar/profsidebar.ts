import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Profservice } from '../profservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profsidebar',
  imports: [CommonModule,RouterModule],
  templateUrl: './profsidebar.html',
  styleUrl: './profsidebar.css',
})
export class Profsidebar {
constructor(public rout:Router,private service: Profservice){}
redirect(){
  this.service.logout();
}
}
