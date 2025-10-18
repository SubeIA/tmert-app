import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EMAIL_VALIDATION, PASSWORD_VALIDATION, COMMON_VALIDATION } from '@core/constants';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule],
  template: `
    @if (control && control.invalid && control.touched) {
      <mat-error class="error-text">
        {{ getErrorMessage() }}
      </mat-error>
    }
  `,
  styles: [
    `
      .error-text {
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        font-weight: 500;
        display: block;
      }
    `,
  ],
})
export class ErrorMessageComponent {
  @Input() control: AbstractControl | null = null;
  @Input() fieldName = '';

  getErrorMessage(): string {
    if (!this.control) {
      return '';
    }

    if (this.control.hasError('required')) {
      return COMMON_VALIDATION.MESSAGES.REQUIRED;
    }

    if (this.control.hasError('email')) {
      return EMAIL_VALIDATION.MESSAGES.INVALID;
    }

    if (this.control.hasError('minlength')) {
      const minLength = this.control.getError('minlength').requiredLength;
      return COMMON_VALIDATION.MESSAGES.MIN_LENGTH(minLength);
    }

    if (this.control.hasError('maxlength')) {
      const maxLength = this.control.getError('maxlength').requiredLength;
      return COMMON_VALIDATION.MESSAGES.MAX_LENGTH(maxLength);
    }

    if (this.control.hasError('pattern')) {
      if (this.fieldName === 'email') {
        return EMAIL_VALIDATION.MESSAGES.INVALID;
      }
      if (this.fieldName === 'password') {
        return PASSWORD_VALIDATION.MESSAGES.INVALID;
      }
      return COMMON_VALIDATION.MESSAGES.PATTERN;
    }

    if (this.control.hasError('min')) {
      const min = this.control.getError('min').min;
      return COMMON_VALIDATION.MESSAGES.MIN_VALUE(min);
    }

    if (this.control.hasError('max')) {
      const max = this.control.getError('max').max;
      return COMMON_VALIDATION.MESSAGES.MAX_VALUE(max);
    }

    return '';
  }
}
