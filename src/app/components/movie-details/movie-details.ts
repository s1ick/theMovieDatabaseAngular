import { Component, inject, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MovieService } from '../../services/movie';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details.html',
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private movieSubscription?: Subscription;

  imdbID = input.required<string>();
  onClose = output<void>();
  isFavorite = input.required<boolean>();
  onToggleFavorite = output<void>();

  movie = signal<any>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadMovieDetails();
  }

  ngOnDestroy(): void {
    this.movieSubscription?.unsubscribe();
  }

  loadMovieDetails(): void {
    const movieId = this.imdbID();
    if (!movieId) return;

    this.isLoading.set(true);
    this.movieSubscription?.unsubscribe();

    this.movieSubscription = this.movieService.getMovieDetails(movieId).subscribe({
      next: (movieData) => {
        this.movie.set(movieData);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching movie details:', error);
        this.movie.set(null);
        this.isLoading.set(false);
      }
    });
  }

  getImageSource(): string {
    const movie = this.movie();
    const posterUrl = movie?.poster;
    const title = movie?.title || 'No Poster';

    // Используем метод из MovieService
    if (!posterUrl || this.isInvalidUrl(posterUrl) || this.isBrokenUrl(posterUrl)) {
      return this.movieService.createFallbackImage(title);
    }

    return posterUrl;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (img.src.startsWith('data:image')) {
      return;
    }

    const title = this.movie()?.title || 'No Poster';

    // Используем метод из MovieService
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
    // Используем приватное поле через any, так как оно нужно для логики
    const brokenPatterns = (this.movieService as any).brokenUrlPatterns;
    return brokenPatterns?.some((pattern: string) => url.includes(pattern)) || false;
  }

  exportToCSV(): void {
    const movie = this.movie();
    if (!movie) return;

    const headers = ['ID', 'Title', 'Year', 'Genre', 'Director', 'Actors', 'Plot', 'IMDb Rating'];
    const row = [
      movie.id,
      `"${movie.title?.replace(/"/g, '""')}"`,
      movie.year,
      movie.genre || 'N/A',
      movie.director || 'N/A',
      movie.actors || 'N/A',
      movie.plot ? `"${movie.plot.replace(/"/g, '""')}"` : 'N/A',
      movie.imdbRating || 'N/A'
    ];

    const csvContent = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${movie.title?.replace(/[^a-z0-9]/gi, '_')}_details.csv` || 'movie_details.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  close(): void {
    this.onClose.emit();
  }

  toggleFavorite(): void {
    this.onToggleFavorite.emit();
  }
}
