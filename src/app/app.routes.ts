import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home')
      .then(c => c.HomeComponent)
  },
  {
    path: 'movie/:id',
    loadComponent: () => import('./components/movie-details/movie-details')
      .then(c => c.MovieDetailsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
