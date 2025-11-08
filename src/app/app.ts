import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from './services/auth';
import { FavoritesService } from './services/favorites';
import { RecommendationsService } from './services/recommendations';
import { MovieService } from './services/movie';

import { HeaderComponent } from './components/header/header';
import { AuthComponent } from './components/auth/auth';
import { UserProfileComponent } from './components/user-profile/user-profile';
import { HomeComponent } from './components/home/home';
import { FavoritesComponent } from './components/favorites/favorites';
import { RecommendationsComponent } from './components/recommendations/recommendations';
import { MovieDetailsComponent } from './components/movie-details/movie-details';

type ActiveTab = 'search' | 'favorites' | 'recommendations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    AuthComponent,
    UserProfileComponent,
    HomeComponent,
    FavoritesComponent,
    RecommendationsComponent,
    MovieDetailsComponent
  ],
  templateUrl: './app.html'
})
export class AppComponent {
  private authService = inject(AuthService);
  private favoritesService = inject(FavoritesService);
  private recommendationsService = inject(RecommendationsService);
  private movieService = inject(MovieService);

  activeTab = signal<ActiveTab>('search');
  selectedMovieId = signal<string | null>(null);

  hasLoadedFavorites = signal(false);
  hasLoadedRecommendations = signal(false);

  user = this.authService.user;
  loading = this.authService.loading;
  favorites = this.favoritesService.favorites;

  setActiveTab(tab: ActiveTab) {
    this.activeTab.set(tab);

    if (tab === 'favorites' && !this.hasLoadedFavorites()) {
      this.hasLoadedFavorites.set(true);
    }

    if (tab === 'recommendations' && !this.hasLoadedRecommendations()) {
      this.hasLoadedRecommendations.set(true);
    }
  }

  isFavorite(movieId: string): boolean {
    return this.favoritesService.isFavorite(movieId);
  }

  selectMovie(movieId: string) {
    this.selectedMovieId.set(movieId);
  }

  closeMovieDetails() {
    this.selectedMovieId.set(null);
  }

  async toggleFavorite(movieId: string) {
    if (this.favoritesService.isFavorite(movieId)) {
      await this.favoritesService.removeFavorite(movieId);
    } else {
      await this.favoritesService.addFavoriteById(movieId);
    }
  }

  onSearchResults(results: any[]) {
    if (results.length > 0) {
      this.recommendationsService.addMoviesToCatalog(results);
    }
  }
}
