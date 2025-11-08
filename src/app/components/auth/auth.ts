import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './auth.html'
})
export class AuthComponent {
  private authService = inject(AuthService);

  email = signal('');
  password = signal('');
  isLogin = signal(true);
  isLoading = signal(false);
  error = signal<string | null>(null);

  async handleAuth(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    this.error.set(null);

    try {
      if (this.isLogin()) {
        await this.authService.signInWithEmail(this.email(), this.password());
      } else {
        await this.authService.registerWithEmail(this.email(), this.password());
      }
    } catch (error: any) {
      this.error.set(error.message);
      console.error('Auth error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async googleSignIn() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.error.set(error.message);
      console.error('Google sign in error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleAuthMode() {
    this.isLogin.set(!this.isLogin());
    this.error.set(null);
  }
}
