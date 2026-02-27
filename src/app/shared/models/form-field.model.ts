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
  | 'date'
  | 'table';

/**
 * Configuración de columna para tablas editables
 */
export interface TableColumnConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  width?: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  /** Si es true, esta columna se muestra en la tabla resumen */
  showInTable?: boolean;
}

/**
 * Configuración para campos de tipo tabla editable
 */
export interface EditableTableConfig {
  columns: TableColumnConfig[];
  minRows?: number;
  maxRows?: number;
  allowAddRow?: boolean;
  allowDeleteRow?: boolean;
  showRowNumbers?: boolean;
  defaultRows?: number;
  /** Usar modal para edición en lugar de edición inline */
  useModal?: boolean;
  /** Permitir adjuntar fotos/evidencia */
  allowPhotos?: boolean;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  hint?: string;
  tooltip?: string;
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

  cols?: number;
  class?: string;
  group?: string;

  /** Configuración para campos de tipo 'table' */
  tableConfig?: EditableTableConfig;
}

export interface FormFieldGroup {
  name: string;
  label: string;
  fields: FormFieldConfig[];
}

export interface FormStepConfig {
  label: string;
  description?: string;
  icon?: string;
  fields?: FormFieldConfig[];
  groups?: FormFieldGroup[];
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
