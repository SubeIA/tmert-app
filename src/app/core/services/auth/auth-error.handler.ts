import { Injectable } from '@angular/core';
import { AuthError } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthErrorHandler {
  private readonly errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión.',
    'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña.',
    'auth/not-configured': 'Firebase no está configurado.',
  };

  handle(error: unknown): AuthError {
    const firebaseError = error as { code?: string; message?: string };
    const code = firebaseError.code || 'auth/unknown';

    return {
      code,
      message: this.errorMessages[code] || 'Ha ocurrido un error inesperado.',
    };
  }

  getMessage(code: string): string {
    return this.errorMessages[code] || 'Ha ocurrido un error inesperado.';
  }
}
