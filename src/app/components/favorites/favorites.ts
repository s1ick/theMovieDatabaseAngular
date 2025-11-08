import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FavoritesService, FavoriteMovie } from '../../services/favorites';
import { MovieService } from '../../services/movie';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './favorites.html',
})
export class FavoritesComponent {
  private favoritesService = inject(FavoritesService);
  private movieService = inject(MovieService);

  movieSelected = output<string>();

  favorites = this.favoritesService.favorites;
  loading = this.favoritesService.loading;

  onSelectMovie(movieId: string) {
    this.movieSelected.emit(movieId);
  }

  async onRemoveFavorite(movieId: string, event: Event) {
    event.stopPropagation();
    try {
      await this.favoritesService.removeFavorite(movieId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  onExportFavorites(): void {
    const favorites = this.favorites();

    if (favorites.length === 0) {
      alert('No favorites to export!');
      return;
    }

    const headers = ['Title', 'Year', 'Genre', 'Director', 'Actors', 'IMDb Rating', 'Added Date'];

    const csvContent = [
      headers.join(','),
      ...favorites.map(movie => [
        `"${this.escapeCsv(movie.title || 'N/A')}"`,
        `"${this.escapeCsv(movie.year || 'N/A')}"`,
        `"${this.escapeCsv(movie.genre || 'N/A')}"`,
        `"${this.escapeCsv(movie.director || 'N/A')}"`,
        `"${this.escapeCsv(movie.actors || 'N/A')}"`,
        `"${this.escapeCsv(movie.imdbRating || 'N/A')}"`,
        `"${this.escapeCsv(movie.addedAt ? new Date(movie.addedAt).toLocaleDateString() : 'N/A')}"`
      ].join(','))
    ].join('\n');

    this.downloadCsv(csvContent, 'my-favorite-movies.csv');
  }

  private escapeCsv(value: string): string {
    return value.replace(/"/g, '""');
  }

  private downloadCsv(content: string, filename: string): void {
    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  getImageSource(movie: FavoriteMovie): string {
    const posterUrl = movie?.poster;
    const title = movie?.title || 'No Poster';

    if (!posterUrl || this.isInvalidUrl(posterUrl) || this.isBrokenUrl(posterUrl)) {
      return this.movieService.createFallbackImage(title);
    }

    return posterUrl;
  }

  onImageError(event: Event, movie: FavoriteMovie): void {
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
