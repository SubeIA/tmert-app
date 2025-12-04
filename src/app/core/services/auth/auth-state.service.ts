import { Injectable, signal } from '@angular/core';
import { User, AuthError } from './auth.types';
import { AUTH_CONSTANTS } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly currentUser = signal<User | null>(null);
  private readonly isAuthenticated = signal<boolean>(false);
  private readonly isLoading = signal<boolean>(false);
  private readonly authError = signal<AuthError | null>(null);
  private readonly isLocalAuth = signal<boolean>(false);

  // Readonly signals para consumo externo
  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly error = this.authError.asReadonly();
  readonly isLocal = this.isLocalAuth.asReadonly();

  setUser(user: User | null, isLocal = false): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(user !== null);
    this.isLocalAuth.set(isLocal);

    if (user) {
      this.persistUser(user);
    } else {
      this.clearPersistedUser();
    }
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setError(error: AuthError | null): void {
    this.authError.set(error);
  }

  clearError(): void {
    this.authError.set(null);
  }

  clear(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isLocalAuth.set(false);
    this.authError.set(null);
    this.clearPersistedUser();
  }

  getPersistedUser(): User | null {
    try {
      const saved = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private persistUser(user: User): void {
    localStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  private clearPersistedUser(): void {
    localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER);
  }
}
