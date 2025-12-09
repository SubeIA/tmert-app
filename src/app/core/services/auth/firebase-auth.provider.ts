import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { AuthResult, LoginCredentials, User } from './auth.types';
import { AuthErrorHandler } from './auth-error.handler';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthProvider {
  private auth = inject(Auth);
  private errorHandler = inject(AuthErrorHandler);

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      return {
        success: true,
        user: this.mapUser(userCredential.user),
      };
    } catch (error) {
      return {
        success: false,
        error: this.errorHandler.handle(error),
      };
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUser(): User | null {
    const fbUser = this.auth.currentUser;
    return fbUser ? this.mapUser(fbUser) : null;
  }

  getFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  getAuth(): Auth {
    return this.auth;
  }

  private mapUser(fbUser: FirebaseUser): User {
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
      photoURL: fbUser.photoURL || undefined,
    };
  }
}
