import { Injectable, signal, inject } from '@angular/core';
import { User, AuthError } from './auth.types';
import { AUTH_CONSTANTS } from '@core/constants';
import { StorageService, StorageType } from '@core/services/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly storageService = inject(StorageService);

  private readonly currentUser = signal<User | null>(null);
  private readonly isAuthenticated = signal<boolean>(false);
  private readonly isLoading = signal<boolean>(false);
  private readonly authError = signal<AuthError | null>(null);
  private readonly isLocalAuth = signal<boolean>(false);
  private readonly rememberMe = signal<boolean>(false);

  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly error = this.authError.asReadonly();
  readonly isLocal = this.isLocalAuth.asReadonly();

  setUser(user: User | null, isLocal = false, remember = false): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(user !== null);
    this.isLocalAuth.set(isLocal);
    this.rememberMe.set(remember);

    if (user) {
      this.persistUser(user, remember);
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
    this.rememberMe.set(false);
    this.authError.set(null);
    this.clearPersistedUser();
  }

  getPersistedUser(): User | null {
    const storageKey = AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER;

    const localUser = this.storageService.getItem<User>(storageKey, StorageType.LOCAL);
    if (localUser) {
      this.rememberMe.set(true);
      return localUser;
    }

    const sessionUser = this.storageService.getItem<User>(storageKey, StorageType.SESSION);
    if (sessionUser) {
      this.rememberMe.set(false);
      return sessionUser;
    }

    return null;
  }

  private persistUser(user: User, remember: boolean): void {
    const storageKey = AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER;

    if (remember) {
      this.storageService.setItem(storageKey, user, StorageType.LOCAL);
      this.storageService.removeItem(storageKey, StorageType.SESSION);
    } else {
      this.storageService.setItem(storageKey, user, StorageType.SESSION);
      this.storageService.removeItem(storageKey, StorageType.LOCAL);
    }
  }

  private clearPersistedUser(): void {
    const storageKey = AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER;
    this.storageService.removeFromBoth(storageKey);
  }
}
