import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_CONSTANTS } from '../constants';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);

  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER);
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        if (
          credentials.email === AUTH_CONSTANTS.DEV_CREDENTIALS.EMAIL &&
          credentials.password === AUTH_CONSTANTS.DEV_CREDENTIALS.PASSWORD
        ) {
          const user: User = { ...AUTH_CONSTANTS.DEV_CREDENTIALS.USER };

          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          localStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          resolve(true);
        } else {
          resolve(false);
        }
      }, AUTH_CONSTANTS.TIMING.LOGIN_DELAY);
    });
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.CURRENT_USER);
    this.router.navigate([AUTH_CONSTANTS.ROUTES.LOGIN]);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
