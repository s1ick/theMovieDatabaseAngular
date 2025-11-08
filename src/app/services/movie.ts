import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Movie {
  id: string;
  title: string;
  year: string;
  poster: string;
  type: string;
  genre?: string;
  director?: string;
  actors?: string;
  runtime?: string;
  plot?: string;
  imdbRating?: string;
  ratings?: Array<{ Source: string; Value: string }>;
}

export interface ApiResponse {
  Search: any[];
  totalResults: string;
  Response: string;
  Error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private apiKey = environment.omdbApiKey;
  private baseUrl = environment.omdbBaseUrl;

  private fallbackCache = new Map<string, string>();

  private readonly brokenUrlPatterns = [
    'MV5BNGYyMDZkZGMtZDdlYy00YmVjLTk4MmMtOWI5NWViNmVkZDU0',
    'MV5BYzEzZGFlYjctNzZiMi00N2YyLWFjODctM2FmYWZmMDI5M2U1',
    'MV5BYjI3OTg1ODUtNTk0Zi00YjVjLWI2MzMtMTEzOGVmODU4MWZk',
    'MV5BNmUxZDE2NWYtOWE5ZC00M2M0LTlkMzEtNGY0NDk5OWQ3YTU5',
    'MV5BOTRmMDExMTAtZDM2MC00YTZlLWE1ODItNTIxMTM3Y2NjZGY5',
    'MV5BN2QzNTQxODAtYzI4Mi00ZjAzLWFjNDgtZThkNDJkNzE1N2Jl',
    'MV5BYTQxYTY1MDgtM2FjNS00YTdlLWE0OTItMDk2YzRlMjYxMGQx'
  ];

  private moviesState = signal<Movie[]>([]);
  private loadingState = signal<boolean>(false);
  private errorState = signal<string | null>(null);

  readonly movies = this.moviesState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  searchMovies(query: string, page: number = 1): Observable<ApiResponse> {
    this.loadingState.set(true);
    this.errorState.set(null);

    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('s', query)
      .set('page', page.toString())
      .set('type', 'movie');

    return this.http.get<ApiResponse>(this.baseUrl, { params })
      .pipe(
        tap({
          next: (response) => {
            if (response.Response === 'True') {
              const movies = response.Search.map(item => this.mapOmdbToMovie(item));
              this.moviesState.set(movies);
            } else {
              this.moviesState.set([]);
              this.errorState.set(response.Error || 'No movies found');
            }
            this.loadingState.set(false);
          },
          error: (error) => {
            this.errorState.set('Search failed');
            this.loadingState.set(false);
          }
        })
      );
  }

  getMovieDetails(movieId: string): Observable<Movie> {
    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('i', movieId)
      .set('plot', 'full');

    return this.http.get<any>(this.baseUrl, { params })
      .pipe(
        map(response => this.mapOmdbToMovie(response))
      );
  }

  private mapOmdbToMovie(omdbData: any): Movie {
    return {
      id: omdbData.imdbID,
      title: omdbData.Title,
      poster: this.getSafeImageUrl(omdbData.Poster),
      year: omdbData.Year,
      type: omdbData.Type,
      genre: omdbData.Genre,
      director: omdbData.Director,
      actors: omdbData.Actors,
      runtime: omdbData.Runtime,
      plot: omdbData.Plot,
      imdbRating: omdbData.imdbRating,
      ratings: omdbData.Ratings
    };
  }

  getSafeImageUrl(posterUrl: string | undefined): string {
    if (!posterUrl || this.isInvalidUrl(posterUrl) || this.isBrokenUrl(posterUrl)) {
      return this.createFallbackImage('Movie Poster');
    }
    return posterUrl;
  }

  private isInvalidUrl(url: string): boolean {
    return url === 'N/A' ||
           url === 'null' ||
           url === 'undefined' ||
           !url.startsWith('http') ||
           url.includes('localhost:4200/N/A');
  }

  private isBrokenUrl(url: string): boolean {
    return this.brokenUrlPatterns.some(pattern => url.includes(pattern));
  }

  addBrokenUrl(url: string): void {
    const patternMatch = url.match(/MV5B[a-zA-Z0-9]+/);
    if (patternMatch && !this.brokenUrlPatterns.includes(patternMatch[0])) {
      this.brokenUrlPatterns.push(patternMatch[0]);
      console.log('Added new broken URL pattern:', patternMatch[0]);
    }
  }

  createFallbackImage(title: string): string {
    const cacheKey = `fallback_${title}`;
    if (this.fallbackCache.has(cacheKey)) {
      return this.fallbackCache.get(cacheKey)!;
    }

    const canvas = document.createElement('canvas');
    const width = 300;
    const height = 450;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f1f5f9');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < width; i += 40) {
      for (let j = 0; j < height; j += 40) {
        if ((i + j) % 80 === 0) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }

    const centerX = width / 2;
    const centerY = height / 2 - 30;

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX - 5, centerY - 5, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(centerX + 35, centerY - 15, 8, 12);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxWidth = width - 40;
    let displayTitle = title;
    let metrics = ctx.measureText(title);

    if (metrics.width > maxWidth) {
      let low = 0;
      let high = title.length;
      let result = title;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testText = title.substring(0, mid) + (mid < title.length ? '...' : '');
        const testMetrics = ctx.measureText(testText);

        if (testMetrics.width <= maxWidth) {
          result = testText;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      displayTitle = result;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.fillText(displayTitle, centerX, centerY + 100);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.fillText('No poster available', centerX, centerY + 130);

    const fallbackUrl = canvas.toDataURL();
    this.fallbackCache.set(cacheKey, fallbackUrl);

    return fallbackUrl;
  }

  clearMovies(): void {
    this.moviesState.set([]);
  }

  clearError(): void {
    this.errorState.set(null);
  }

  clearAll(): void {
    this.moviesState.set([]);
    this.errorState.set(null);
    this.loadingState.set(false);
  }
}
