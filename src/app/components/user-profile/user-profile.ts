import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './user-profile.html',
})
export class UserProfileComponent {
  private authService = inject(AuthService);

  user = input.required<User>();
  isLoggingOut = signal(false);

async handleLogout() {
  this.isLoggingOut.set(true);
  try {
    await this.authService.signOut();

    const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
    window.location.href = baseHref;

  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    this.isLoggingOut.set(false);
  }
}

  getUserAvatar(): string {
    const userData = this.user();
    if (userData.photoURL) {
      return userData.photoURL;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.email || 'User')}&background=random`;
  }

  getDisplayName(): string {
    const userData = this.user();
    return userData.displayName || userData.email || 'User';
  }
}
