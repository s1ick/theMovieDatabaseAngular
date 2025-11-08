import { Injectable, inject, signal, DestroyRef, runInInjectionContext, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from '@angular/fire/firestore';
import { AuthService } from './auth';
import { Movie } from './movie';

export interface FavoriteMovie extends Movie {
  addedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  favorites = signal<FavoriteMovie[]>([]);
  loading = signal(true);
  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    this.setupUserSubscription();
  }

  private setupUserSubscription(): void {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.unsubscribeFromFavorites();
          if (user) {
            this.subscribeToFavorites(user.uid);
          } else {
            this.clearFavorites();
          }
        }
      });
  }

  private subscribeToFavorites(userId: string): void {
    this.unsubscribeFromFavorites();
    this.loading.set(true);

    runInInjectionContext(this.injector, () => {
      try {
        const favoritesRef = collection(this.firestore, 'users', userId, 'favorites');

        this.unsubscribe = onSnapshot(favoritesRef,
          (snapshot) => {
            const favs = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data['title'] || data['Title'] || '',
                year: data['year'] || data['Year'] || '',
                poster: data['poster'] || data['Poster'] || '',
                type: data['type'] || data['Type'] || 'movie',
                genre: data['genre'] || data['Genre'] || '',
                director: data['director'] || data['Director'] || '',
                actors: data['actors'] || data['Actors'] || '',
                plot: data['plot'] || data['Plot'] || '',
                imdbRating: data['imdbRating'] || '',
                addedAt: data['addedAt'] || new Date().toISOString()
              } as FavoriteMovie;
            });
            this.favorites.set(favs);
            this.loading.set(false);
          },
          (error) => {
            console.error('Error fetching favorites:', error);
            this.loading.set(false);
          }
        );
      } catch (error) {
        console.error('Error setting up favorites subscription:', error);
        this.loading.set(false);
      }
    });
  }

  private unsubscribeFromFavorites(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private clearFavorites(): void {
    this.favorites.set([]);
    this.loading.set(false);
  }

  async addFavorite(movie: Movie): Promise<void> {
    const user = this.authService.currentUser;
    if (!user) throw new Error('User not authenticated');

    const movieData = {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      poster: movie.poster,
      type: movie.type || 'movie',
      genre: movie.genre || '',
      director: movie.director || '',
      actors: movie.actors || '',
      plot: movie.plot || '',
      imdbRating: movie.imdbRating || '',
      addedAt: new Date().toISOString()
    };

    await runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, 'users', user.uid, 'favorites', movie.id);
      await setDoc(docRef, movieData);
    });
  }

  async removeFavorite(movieId: string): Promise<void> {
    const user = this.authService.currentUser;
    if (!user) throw new Error('User not authenticated');

    await runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, 'users', user.uid, 'favorites', movieId);
      await deleteDoc(docRef);
    });
  }

  isFavorite(movieId: string): boolean {
    return this.favorites().some(fav => fav.id === movieId);
  }

  async addFavoriteById(movieId: string): Promise<void> {
    const minimalMovie: Movie = {
      id: movieId,
      title: 'Loading...',
      year: '',
      poster: '',
      type: 'movie'
    };
    await this.addFavorite(minimalMovie);
  }

  ngOnDestroy(): void {
    this.unsubscribeFromFavorites();
  }
}
