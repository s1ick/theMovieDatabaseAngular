import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.html'
})
export class MovieCardComponent {
  private movieService = inject(MovieService);

  movie = input.required<any>();
  movieSelected = output<string>();

  onCardClick(): void {
    this.movieSelected.emit(this.movie().id);
  }

  getImageSource(): string {
    const movie = this.movie();
    const posterUrl = movie?.poster;
    const title = movie?.title || 'No Poster';

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

    const title = this.movie().title || 'No Poster';
    this.movieService.addBrokenUrl(img.src);
    img.src = this.movieService.createFallbackImage(title);
  }

  private isInvalidUrl(url: string): boolean {
    return url === 'N/A' ||
           url === 'null' ||
           url === 'undefined' ||
           !url.startsWith('http');
  }

  private isBrokenUrl(url: string): boolean {
    return this.movieService['brokenUrlPatterns'].some((pattern: string) => url.includes(pattern));
  }
}
