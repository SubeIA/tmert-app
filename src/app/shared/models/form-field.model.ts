import { ValidatorFn } from '@angular/forms';
import { SelectOption } from '@shared/components/form-controls';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: string | number | boolean | Date | null;
  validators?: ValidatorFn[];

  prefixIcon?: string;
  suffixIcon?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;

  rows?: number;

  options?: SelectOption[];
  multiple?: boolean;

  labelPosition?: 'before' | 'after';
  color?: 'primary' | 'accent' | 'warn';

  minDate?: Date;
  maxDate?: Date;

  cols?: number; // Grid columns (1-12)
  class?: string;
}

export interface FormStepConfig {
  label: string;
  description?: string;
  icon?: string;
  fields: FormFieldConfig[];
  optional?: boolean;
  completed?: boolean;
}

export interface FormStepperConfig {
  title?: string;
  steps: FormStepConfig[];
  linear?: boolean;
  orientation?: 'horizontal' | 'vertical';
  submitButtonText?: string;
  cancelButtonText?: string;
  nextButtonText?: string;
  previousButtonText?: string;
}
