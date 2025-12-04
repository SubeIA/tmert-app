import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  InputComponent,
  TextareaComponent,
  SelectComponent,
  CheckboxComponent,
  DatepickerComponent,
} from '@shared/components/form-controls';
import {
  FormFieldConfig,
  FormFieldGroup,
  FormStepConfig,
  FormStepperConfig,
} from '@shared/models/form-field.model';
import { COMMON_UI } from '@core/constants';

@Component({
  selector: 'app-form-stepper',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    CheckboxComponent,
    DatepickerComponent,
  ],
  templateUrl: './form-stepper.component.html',
  styleUrl: './form-stepper.component.scss',
})
export class FormStepperComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() config!: FormStepperConfig;
  @Output() formSubmit = new EventEmitter<Record<string, unknown>>();
  @Output() formCancel = new EventEmitter<void>();

  readonly UI = COMMON_UI;

  stepForms: FormGroup[] = [];
  isSubmitting = false;

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    if (!this.config || !this.config.steps) {
      throw new Error('FormStepperComponent requires a valid config with steps');
    }

    this.stepForms = this.config.steps.map(step => {
      const allFields = this.getAllFieldsFromStep(step);
      return this.createFormGroup(allFields);
    });
  }

  private getAllFieldsFromStep(step: FormStepConfig): FormFieldConfig[] {
    const fields: FormFieldConfig[] = [];

    if (step.fields) {
      fields.push(...step.fields);
    }

    if (step.groups) {
      step.groups.forEach(group => {
        fields.push(...group.fields);
      });
    }

    return fields;
  }

  getStepGroups(step: FormStepConfig): FormFieldGroup[] {
    return step.groups || [];
  }

  getStepFields(step: FormStepConfig): FormFieldConfig[] {
    return step.fields || [];
  }

  hasGroups(step: FormStepConfig): boolean {
    return !!step.groups && step.groups.length > 0;
  }

  hasUngroupedFields(step: FormStepConfig): boolean {
    return !!step.fields && step.fields.length > 0;
  }

  private createFormGroup(fields: FormFieldConfig[]): FormGroup {
    const group: Record<string, unknown[]> = {};

    fields.forEach(field => {
      const validators: ValidatorFn[] = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.validators) {
        validators.push(...field.validators);
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      if (field.maxLength) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }

      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }

      group[field.name] = [field.value !== undefined ? field.value : '', validators];
    });

    return this.fb.group(group);
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      const formData = this.getAllFormValues();
      this.formSubmit.emit(formData);
    } else {
      this.markAllStepsAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private isFormValid(): boolean {
    return this.stepForms.every(form => form.valid);
  }

  private getAllFormValues(): Record<string, unknown> {
    const allValues: Record<string, unknown> = {};

    this.stepForms.forEach(form => {
      Object.assign(allValues, form.value);
    });

    return allValues;
  }

  private markAllStepsAsTouched(): void {
    this.stepForms.forEach(form => form.markAllAsTouched());
  }

  isInputType(type: string): boolean {
    return ['text', 'email', 'password', 'number', 'tel', 'url'].includes(type);
  }

  getFieldColsClass(field: FormFieldConfig): string {
    const cols = field.cols || 12;
    return `col-${cols}`;
  }

  get submitButtonText(): string {
    return this.config.submitButtonText || this.UI.ACTIONS.SUBMIT;
  }

  get cancelButtonText(): string {
    return this.config.cancelButtonText || this.UI.ACTIONS.CANCEL;
  }

  get nextButtonText(): string {
    return this.config.nextButtonText || this.UI.ACTIONS.NEXT;
  }

  get previousButtonText(): string {
    return this.config.previousButtonText || this.UI.ACTIONS.BACK;
  }
}
