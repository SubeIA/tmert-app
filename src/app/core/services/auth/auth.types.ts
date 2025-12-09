export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role?: 'admin' | 'evaluator' | 'viewer';
  companyIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Company {
  id: string;
  name: string;
  rut?: string;
  address?: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  evaluatorIds?: string[];
  evaluations?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TmertEvaluation {
  id: string;
  companyId: string;
  companyName: string;
  evaluatorId: string;
  evaluatorName: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  progress: number;
  startDate?: Date;
  completedDate?: Date;
  data?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
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
