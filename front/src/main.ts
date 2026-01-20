import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

//enregistrer les composant de chartjs
import { registerables } from 'chart.js';
import { Chart } from 'chart.js';
Chart.register(...registerables);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
