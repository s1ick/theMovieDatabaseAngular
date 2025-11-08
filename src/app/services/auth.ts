import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  User
} from '@angular/fire/auth';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  user = signal<AppUser | null>(null);
  loading = signal(true);

  user$ = authState(this.auth);

  constructor() {
    this.user$.subscribe((user: User | null) => {
      if (user) {
        this.user.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        this.user.set(null);
      }
      this.loading.set(false);
    });
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async registerWithEmail(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (error: any) {
      console.error('Email registration error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-blocked': 'Popup was blocked by browser.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }

  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  get currentUser() {
    return this.user();
  }
}
