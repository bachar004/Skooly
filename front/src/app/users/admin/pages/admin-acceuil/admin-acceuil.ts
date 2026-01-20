import { Component } from '@angular/core';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminAcceuilService } from '../../services/admin-acceuil-service';
import { CommonModule } from '@angular/common';
import { ChartType, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-admin-acceuil',
  standalone:true,
  imports: [AdminSidebar,RouterModule,FormsModule,CommonModule,BaseChartDirective],
  templateUrl: './admin-acceuil.html',
  styleUrl: './admin-acceuil.css',
})
export class AdminAcceuil {
  constructor(private service : AdminAcceuilService){}
  ngOnInit() {
    this.getall();
  }
  stats:any;
  // les charts 
  chartType: ChartType = 'pie';
  chartOptions: ChartOptions = { 
    responsive: true,
    plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        font: {
          size: 16,
          weight: 'bold'
        },
        boxWidth: 30,
        padding: 15
      }
    },
    tooltip: {
      enabled: true
    }
  }
  };
  chartData: any = {
    labels: [],
    datasets: [{ data: [],label:'',backgroundColor: []}]
  };

  getall(){
    // pour nb des etud,prof et classe
    this.service.getStats().subscribe({
      next:(data)=>{
        this.stats=data;
      },
      error:(err)=>{
        console.error(err)
      }
    });
    //pour les pourcentages
    this.service.getpercent().subscribe({
      next:(data:any)=>{
        const labels = data.map((d: any) => d.niv);
        const valeurs = data.map((d: any) => d.per);
        this.chartData =
          {
            labels:labels,
            datasets:[
              {data:valeurs,label:"Pourcentage %",backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']}
            ]
          };
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }
  
}
