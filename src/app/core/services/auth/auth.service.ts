import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { onAuthStateChanged } from '@angular/fire/auth';
import { AUTH_CONSTANTS } from '@core/constants';
import { environment } from '../../../../environments/environment';

import { AuthStateService } from './auth-state.service';
import { DemoAuthProvider } from './demo-auth.provider';
import { FirebaseAuthProvider } from './firebase-auth.provider';
import { LoginCredentials } from './auth.types';

export type { User, LoginCredentials, AuthError } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private state = inject(AuthStateService);
  private demoAuth = inject(DemoAuthProvider);
  private firebaseAuth: FirebaseAuthProvider | null = null;

  readonly user = this.state.user;
  readonly authenticated = this.state.authenticated;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  private get isFirebaseConfigured(): boolean {
    return (
      environment.firebase?.apiKey !== 'TU_API_KEY' &&
      environment.firebase?.apiKey !== undefined &&
      environment.firebase?.apiKey !== ''
    );
  }

  constructor() {
    if (this.isFirebaseConfigured) {
      this.firebaseAuth = inject(FirebaseAuthProvider);
    }
    this.initAuthListener();
  }

  private initAuthListener(): void {
    const savedUser = this.state.getPersistedUser();
    if (savedUser?.id === 'demo-user-001') {
      this.demoAuth.setCurrentUser(savedUser);
      this.state.setUser(savedUser, true, true);
      return;
    }

    if (this.firebaseAuth) {
      onAuthStateChanged(this.firebaseAuth.getAuth(), fbUser => {
        if (fbUser) {
          const user = this.firebaseAuth!.getCurrentUser();
          const wasRemembered = savedUser !== null;
          this.state.setUser(user, false, wasRemembered);
        } else if (!this.state.isLocal()) {
          this.state.clear();
        }
      });
    }
  }

  async login(credentials: LoginCredentials, remember = false): Promise<boolean> {
    this.state.setLoading(true);
    this.state.clearError();

    if (this.demoAuth.isDemoEmail(credentials.email)) {
      const result = await this.demoAuth.login(credentials);
      this.state.setLoading(false);

      if (result.success && result.user) {
        this.state.setUser(result.user, true, remember);
        return true;
      }
      if (result.error) {
        this.state.setError(result.error);
      }
      return false;
    }

    if (!this.firebaseAuth) {
      this.state.setError({
        code: 'auth/not-configured',
        message: 'Firebase no está configurado. Usa las credenciales demo.',
      });
      this.state.setLoading(false);
      return false;
    }

    const result = await this.firebaseAuth.login(credentials);
    this.state.setLoading(false);

    if (result.success && result.user) {
      this.state.setUser(result.user, false, remember);
      return true;
    }
    if (result.error) {
      this.state.setError(result.error);
    }
    return false;
  }

  async logout(): Promise<void> {
    this.state.setLoading(true);

    if (this.state.isLocal()) {
      await this.demoAuth.logout();
    } else if (this.firebaseAuth) {
      await this.firebaseAuth.logout();
    }

    this.state.clear();
    this.state.setLoading(false);
    this.router.navigate([AUTH_CONSTANTS.ROUTES.LOGIN]);
  }

  clearError(): void {
    this.state.clearError();
  }

  isLoggedIn(): boolean {
    return this.state.authenticated();
  }
}
