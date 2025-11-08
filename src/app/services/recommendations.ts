import { Injectable, inject, computed, signal } from '@angular/core';
import { FavoritesService, FavoriteMovie } from './favorites';
import { MovieService, Movie } from './movie';

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService {
  private favoritesService = inject(FavoritesService);
  private movieService = inject(MovieService);

  private allMoviesState = signal<Movie[]>([]);

  recommendations = computed(() => {
    const favorites = this.favoritesService.favorites();
    const allMovies = this.allMoviesState();

    if (favorites.length === 0 || allMovies.length === 0) return [];

    const userPreferences = this.extractGenres(favorites);
    const currentYear = new Date().getFullYear();

    const uniqueMovies = allMovies.filter((movie, index, self) =>
      index === self.findIndex(m => m.id === movie.id) &&
      !favorites.some(fav => fav.id === movie.id)
    );

    const scoredMovies = uniqueMovies.map(movie => {
      let score = 0;

      if (movie.genre) {
        movie.genre.split(', ').forEach(genre => {
          score += (userPreferences[genre] || 0);
        });
      }

      const year = parseInt(movie.year);
      if (!isNaN(year) && year >= currentYear - 10) {
        score += 1;
      }

      return { ...movie, score };
    });

    const sorted = scoredMovies.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.id.charCodeAt(0) - b.id.charCodeAt(0)) * (Math.random() > 0.5 ? 1 : -1);
    });

    return this.getUniqueRecommendations(sorted.slice(0, 15));
  });

  addMoviesToCatalog(movies: Movie[]) {
    const currentMovies = this.allMoviesState();
    const newMovies = movies.filter(m =>
      !currentMovies.some(cm => cm.id === m.id)
    );
    this.allMoviesState.set([...currentMovies, ...newMovies]);
  }

  private extractGenres(favorites: FavoriteMovie[]): Record<string, number> {
    const genreCount: Record<string, number> = {};

    favorites.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(', ').forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    return genreCount;
  }

  private getUniqueRecommendations(movies: any[]): any[] {
    const seen = new Set();
    const result = [];

    for (const movie of movies) {
      if (!seen.has(movie.id)) {
        seen.add(movie.id);
        result.push(movie);
      }
    }

    return result.slice(0, 10);
  }
}
