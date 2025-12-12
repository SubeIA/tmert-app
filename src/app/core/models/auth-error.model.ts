export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AuthError;
}
