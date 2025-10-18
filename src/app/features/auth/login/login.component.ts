import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@material/material.module';
import { AuthService } from '@core/services/auth.service';
import { InputComponent } from '@shared/components/form-controls';
import {
  LOGIN_UI,
  LOGIN_CONSTANTS,
  AUTH_CONSTANTS,
  EMAIL_VALIDATION,
  PASSWORD_VALIDATION,
  COMMON_UI,
} from '@core/constants';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MaterialModule, InputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly UI = LOGIN_UI;
  readonly devCredentials = LOGIN_CONSTANTS.DEV_CREDENTIALS;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(EMAIL_VALIDATION.LENGTH.MAX)],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(PASSWORD_VALIDATION.LENGTH.MIN),
        Validators.maxLength(PASSWORD_VALIDATION.LENGTH.MAX),
      ],
    ],
    rememberMe: [false],
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      try {
        const { email, password } = this.loginForm.value;
        const success = await this.authService.login({ email, password });

        if (success) {
          this.router.navigate([AUTH_CONSTANTS.ROUTES.AFTER_LOGIN]);
        } else {
          this.errorMessage.set(COMMON_UI.NOTIFICATIONS.ERROR.LOGIN);
        }
      } catch {
        this.errorMessage.set(COMMON_UI.NOTIFICATIONS.ERROR.GENERIC);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
