import { Injectable } from '@angular/core';
import { AuthProvider, AuthResult, LoginCredentials, User } from './auth.types';

const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@tmert.cl',
  name: 'Usuario Demo',
  role: 'admin',
};

const DEMO_CREDENTIALS = {
  email: 'demo@tmert.cl',
  password: 'demo123',
};

@Injectable({
  providedIn: 'root',
})
export class DemoAuthProvider implements AuthProvider {
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await this.delay(500);

    if (this.isValidCredentials(credentials)) {
      this.currentUser = { ...DEMO_USER };
      return { success: true, user: this.currentUser };
    }

    return {
      success: false,
      error: {
        code: 'auth/invalid-credentials',
        message: 'Credenciales demo inválidas. Usa demo@tmert.cl / demo123',
      },
    };
  }

  async logout(): Promise<void> {
    await this.delay(200);
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  isValidCredentials(credentials: LoginCredentials): boolean {
    return (
      credentials.email === DEMO_CREDENTIALS.email &&
      credentials.password === DEMO_CREDENTIALS.password
    );
  }

  isDemoEmail(email: string): boolean {
    return email === DEMO_CREDENTIALS.email;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
