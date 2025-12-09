export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role?: 'admin' | 'user' | 'viewer';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: AuthError;
}

export interface AuthProvider {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}
