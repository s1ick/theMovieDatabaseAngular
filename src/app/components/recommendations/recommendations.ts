import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RecommendationsService } from '../../services/recommendations';
import { FavoritesService } from '../../services/favorites';
import { MovieService } from '../../services/movie';
import { Movie } from '../../services/movie';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './recommendations.html',
})
export class RecommendationsComponent {
  private recommendationsService = inject(RecommendationsService);
  private favoritesService = inject(FavoritesService);
  private movieService = inject(MovieService);

  movieSelected = output<string>();

  recommendations = this.recommendationsService.recommendations;

  onSelectMovie(movieId: string) {
    this.movieSelected.emit(movieId);
  }

  async onAddFavorite(movie: Movie, event: Event) {
    event.stopPropagation();
    try {
      await this.favoritesService.addFavorite(movie);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  getFirstGenre(genre?: string): string {
    if (!genre) return '';
    return genre.split(', ')[0];
  }

  getImageSource(movie: Movie): string {
    const posterUrl = movie?.poster;
    const title = movie?.title || 'No Poster';

    if (!posterUrl || this.isInvalidUrl(posterUrl) || this.isBrokenUrl(posterUrl)) {
      return this.movieService.createFallbackImage(title);
    }

    return posterUrl;
  }

  onImageError(event: Event, movie: Movie): void {
    const img = event.target as HTMLImageElement;

    if (img.src.startsWith('data:image')) {
      return;
    }

    const title = movie.title || 'No Poster';

    this.movieService.addBrokenUrl(img.src);

    img.src = this.movieService.createFallbackImage(title);
  }

  private isInvalidUrl(url: string): boolean {
    return url === 'N/A' ||
           url === 'null' ||
           url === 'undefined' ||
           !url.startsWith('http') ||
           url.includes('localhost:4200/N/A');
  }

  private isBrokenUrl(url: string): boolean {
    const brokenPatterns = (this.movieService as any).brokenUrlPatterns;
    return brokenPatterns.some((pattern: string) => url.includes(pattern));
  }
}
