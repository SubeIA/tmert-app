/* eslint-disable no-console */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
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
import { Subscription } from 'rxjs';

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
export class FormStepperComponent implements OnInit, OnChanges, OnDestroy {
  private fb = inject(FormBuilder);
  private subscriptions: Subscription[] = [];

  @Input() config!: FormStepperConfig;
  @Input() initialStep = 0;
  @Output() formSubmit = new EventEmitter<Record<string, unknown>>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<{
    stepIndex: number;
    stepData: Record<string, unknown>;
  }>();
  @Output() saveProgress = new EventEmitter<{
    stepIndex: number;
    stepData: Record<string, unknown>;
  }>();

  readonly UI = COMMON_UI;

  stepForms: FormGroup[] = [];
  isSubmitting = false;
  isSaving = signal(false);

  // Signal para forzar actualización del template
  formStatusUpdate = signal(0);

  ngOnInit(): void {
    this.initializeForms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.initializeForms();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForms(): void {
    if (!this.config || !this.config.steps) {
      throw new Error('FormStepperComponent requires a valid config with steps');
    }

    // Limpiar suscripciones anteriores
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    this.stepForms = this.config.steps.map(step => {
      const allFields = this.getAllFieldsFromStep(step);
      const formGroup = this.createFormGroup(allFields);

      // Suscribirse a cambios del formulario para actualizar el template
      const subscription = formGroup.valueChanges.subscribe(() => {
        this.formStatusUpdate.set(this.formStatusUpdate() + 1);
      });

      const statusSubscription = formGroup.statusChanges.subscribe(() => {
        this.formStatusUpdate.set(this.formStatusUpdate() + 1);
      });

      this.subscriptions.push(subscription, statusSubscription);

      return formGroup;
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

      group[field.name] = [
        { value: field.value !== undefined ? field.value : '', disabled: field.disabled || false },
        validators,
      ];
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

  /**
   * Método llamado cuando el usuario avanza a otro step
   */
  onStepChange(stepIndex: number): void {
    const stepData = this.stepForms[stepIndex]?.value || {};
    this.stepChange.emit({ stepIndex, stepData });
  }

  /**
   * Método para guardar el progreso del step actual sin cambiar de step
   */
  async onSaveProgress(stepper: { selectedIndex: number }): Promise<void> {
    const currentStepIndex = stepper.selectedIndex;
    const stepData = this.stepForms[currentStepIndex]?.value || {};

    this.isSaving.set(true);
    this.saveProgress.emit({ stepIndex: currentStepIndex, stepData });

    // Simular delay para feedback visual
    setTimeout(() => {
      this.isSaving.set(false);
    }, 1000);
  }

  // Método de depuración para ver campos inválidos
  getInvalidFields(stepIndex: number): string[] {
    const form = this.stepForms[stepIndex];
    const invalidFields: string[] = [];

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.invalid) {
        invalidFields.push(key);
      }
    });

    return invalidFields;
  }

  // Método de depuración para ver el estado del formulario
  logFormStatus(stepIndex: number): void {
    const form = this.stepForms[stepIndex];
    console.log('=== FORM DEBUG ===');
    console.log('Step:', this.config.steps[stepIndex].label);
    console.log('Form Valid:', form.valid);
    console.log('Form Status:', form.status);
    console.log('Form Value:', form.value);

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        console.log(`Field: ${key}`, {
          value: control.value,
          valid: control.valid,
          errors: control.errors,
          touched: control.touched,
          dirty: control.dirty,
        });
      }
    });
    console.log('==================');
  }
}
