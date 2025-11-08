import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MovieService } from '../../services/movie';
import { RecommendationsService } from '../../services/recommendations';
import { SearchComponent } from '../search/search';
import { MovieCardComponent } from '../movie-card/movie-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchComponent,
    MovieCardComponent
  ],
  templateUrl: './home.html',
})
export class HomeComponent {
  private movieService = inject(MovieService);
  private recommendationsService = inject(RecommendationsService);

  onSearch = output<any[]>();
  movieSelected = output<string>();

  error = signal<string | null>(null);
  localMovies = signal<any[]>([]);

  async handleSearch(query: string) {
    try {
      if (!query.trim()) {
        this.localMovies.set([]);
        this.onSearch.emit([]);
        this.error.set(null);
        return;
      }

      this.movieService.searchMovies(query, 1).subscribe({
        next: (response) => {
          if (response.Response === 'True') {
            const results = response.Search.map((movie: any) => ({
              id: movie.imdbID,
              title: movie.Title,
              year: movie.Year,
              poster: movie.Poster,
              type: movie.Type,
              genre: movie.Genre
            }));

            this.localMovies.set(results);
            this.onSearch.emit(results);
            this.error.set(null);

            this.recommendationsService.addMoviesToCatalog(results);
          } else {
            this.localMovies.set([]);
            this.onSearch.emit([]);
            this.error.set(response.Error || 'No movies found');
          }
        },
        error: (err) => {
          console.error('Search error:', err);
          this.error.set('Failed to search movies. Please try again.');
          this.localMovies.set([]);
          this.onSearch.emit([]);
        }
      });

    } catch (err) {
      console.error('Search error:', err);
      this.error.set('Failed to search movies. Please try again.');
      this.localMovies.set([]);
      this.onSearch.emit([]);
    }
  }

  onSelectMovie(movieId: string) {
    this.movieSelected.emit(movieId);
  }
}
