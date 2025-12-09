import { User } from '@models/user.model';
import { LoginCredentials } from './auth-credentials.model';
import { AuthResult } from './auth-error.model';

export interface AuthProvider {
  login(credentials: LoginCredentials): Promise<AuthResult<User>>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}
