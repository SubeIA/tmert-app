/* eslint-disable no-console */
import {
  Component,
  OnInit,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormStepperComponent } from '@shared/components/form-stepper/form-stepper.component';
import { FloatingChatComponent } from '@shared/components/floating-chat/floating-chat.component';
import { TMERT_EVALUATION_CONFIG } from './tmert-evaluation.config';
import { EvaluationFirestoreService } from '@core/services/firestore/evaluation-firestore.service';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { FormStepperConfig } from '@shared/models/form-field.model';
import { ChatMessage } from '@shared/components/chat-assistant/chat-assistant.component';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-tmert-evaluation',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, FormStepperComponent, FloatingChatComponent],
  templateUrl: './tmert-evaluation.component.html',
  styleUrl: './tmert-evaluation.component.scss',
})
export class TmertEvaluationComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private evaluationService = inject(EvaluationFirestoreService);
  private companyService = inject(CompanyFirestoreService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(FormStepperComponent) formStepper?: FormStepperComponent;

  evaluationId = signal<string | null>(null);
  companyId = signal<string | null>(null);
  companyName = signal<string>('');
  companyRut = signal<string>('');
  loading = signal(false);
  dataLoaded = signal(false);
  threadId = signal<string | null>(null);
  currentStepIndex = signal<number>(0);
  stepsData = signal<Record<string, Record<string, unknown>>>({});

  // Cachear la configuración del formulario
  private _formConfig: FormStepperConfig | null = null;

  // ID del asistente TMERT
  assistantId = 'asst_0FVEBBSZkkEf1XxdoBEW80vc';

  // ID del usuario actual desde el servicio de autenticación
  get userId(): string {
    return this.authService.user()?.id || 'anonymous';
  }

  get formConfig(): FormStepperConfig {
    // Si ya está cacheado y tenemos los datos de la empresa, devolver el cache
    if (this._formConfig && this.companyName() && this.companyRut()) {
      return this._formConfig;
    }

    const config = { ...TMERT_EVALUATION_CONFIG };

    config.steps = config.steps.map(step => {
      if (step.label === 'Unidades Empresa / Identificación') {
        return {
          ...step,
          fields:
            step.fields?.map(field => {
              if (field.name === 'company_name') {
                return { ...field, value: this.companyName(), readonly: true };
              }
              if (field.name === 'company_rut') {
                return { ...field, value: this.companyRut(), readonly: true };
              }
              return field;
            }) || [],
        };
      }
      return step;
    });

    this._formConfig = config;
    return config;
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.evaluationId.set(id);
      await this.loadEvaluation(id);
    } else {
      console.warn('No evaluation ID found in route');
    }
  }

  ngAfterViewInit() {
    // El parcheo de valores se hace después de loadEvaluation cuando los datos están listos
    console.log('ngAfterViewInit - formStepper disponible:', !!this.formStepper);
  }

  /**
   * Parchear los valores guardados en los formularios
   */
  private patchFormValues(): void {
    const savedStepsData = this.stepsData();

    console.log('🔧 patchFormValues iniciado');
    console.log('  - formStepper existe:', !!this.formStepper);
    console.log('  - savedStepsData:', savedStepsData);
    console.log('  - savedStepsData keys:', Object.keys(savedStepsData));

    if (!this.formStepper) {
      console.warn('❌ formStepper no disponible');
      return;
    }

    if (Object.keys(savedStepsData).length === 0) {
      console.log('ℹ️ No hay datos guardados para parchear');
      return;
    }

    console.log('🔄 Parcheando valores guardados en formularios:', savedStepsData);
    console.log('📝 Número de formularios disponibles:', this.formStepper.stepForms.length);

    // Usar setTimeout para asegurar que los formularios estén completamente renderizados
    setTimeout(() => {
      this.formStepper?.stepForms.forEach((form, index) => {
        const stepKey = `step_${index}`;
        const savedData = savedStepsData[stepKey];

        if (savedData && Object.keys(savedData).length > 0) {
          console.log(`✏️ Parcheando step ${index}:`, savedData);
          console.log(`  Controles en el formulario:`, Object.keys(form.controls));

          // Parchear cada campo individualmente para mejor control
          Object.keys(savedData).forEach(fieldKey => {
            const control = form.get(fieldKey);
            if (control) {
              const value = savedData[fieldKey];
              control.setValue(value);
              console.log(`  ✅ ${fieldKey}: "${value}"`);
            } else {
              console.warn(`  ⚠️ Control "${fieldKey}" no encontrado en step ${index}`);
            }
          });

          // Marcar como pristine para no activar validación de cambios
          form.markAsPristine();
        } else {
          console.log(`ℹ️ No hay datos guardados para step ${index}`);
        }
      });

      // Forzar detección de cambios
      this.cdr.detectChanges();
      console.log('✅ Parcheo completado');
    }, 150);
  }

  async loadEvaluation(id: string) {
    this.loading.set(true);
    try {
      const evaluation = await this.evaluationService.getEvaluation(id);
      console.log('📦 Evaluación completa desde Firestore:', evaluation);

      if (evaluation) {
        this.companyId.set(evaluation.companyId);
        this.companyName.set(evaluation.companyName);

        // Cargar RUT desde la empresa
        const company = await this.companyService.getCompany(evaluation.companyId);
        if (company?.rut) {
          this.companyRut.set(company.rut);
        }

        // Cargar datos de steps y progreso
        console.log('🔍 Verificando stepsData:', {
          exists: !!evaluation.stepsData,
          type: typeof evaluation.stepsData,
          keys: evaluation.stepsData ? Object.keys(evaluation.stepsData) : [],
          value: evaluation.stepsData,
        });

        if (evaluation.stepsData) {
          this.stepsData.set(evaluation.stepsData);
          console.log('✅ Datos de steps cargados:', evaluation.stepsData);
        } else {
          console.warn('⚠️ evaluation.stepsData está vacío o undefined');
        }

        if (evaluation.currentStep !== undefined) {
          this.currentStepIndex.set(evaluation.currentStep);
          console.log('✅ Step actual cargado:', evaluation.currentStep);
        }

        // Invalidar cache del formulario para que se regenere con los nuevos datos
        this._formConfig = null;

        // Marcar que los datos están listos
        this.dataLoaded.set(true);
        console.log('Configuración del formulario regenerada con datos guardados');

        // Parchear valores después de que el formulario se renderice
        setTimeout(() => {
          console.log('⏱️ Llamando a patchFormValues después de 300ms');
          this.patchFormValues();
        }, 300);
      } else {
        console.error('Evaluation not found with ID:', id);
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async onFormSubmit(_formData: Record<string, unknown>) {
    const id = this.evaluationId();
    if (!id) return;

    this.loading.set(true);
    try {
      const totalSteps = TMERT_EVALUATION_CONFIG.steps.length;
      const progress = 100; // Formulario completado

      await this.evaluationService.updateEvaluation(id, {
        data: _formData,
        stepsData: this.stepsData(),
        status: 'completed',
        progress,
        currentStep: totalSteps,
        completedDate: new Date(),
      });

      alert('Evaluación completada exitosamente');
      this.router.navigate(['/evaluations']);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Error al guardar la evaluación');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Guardar el progreso del step actual (llamado desde botón Guardar Progreso)
   */
  async onSaveProgress(event: {
    stepIndex: number;
    stepData: Record<string, unknown>;
    onComplete?: () => void;
  }): Promise<void> {
    const { stepIndex, stepData, onComplete } = event;

    try {
      await this.onStepChange(stepIndex, stepData);
    } finally {
      // Notificar que el guardado terminó
      if (onComplete) {
        onComplete();
      }
    }
  }

  /**
   * Guardar el progreso del step actual
   */
  async onStepChange(stepIndex: number, stepData: Record<string, unknown>): Promise<void> {
    const id = this.evaluationId();
    if (!id) return;

    // Actualizar datos del step
    const stepKey = `step_${stepIndex}`;
    const updatedStepsData = {
      ...this.stepsData(),
      [stepKey]: stepData,
    };
    this.stepsData.set(updatedStepsData);
    this.currentStepIndex.set(stepIndex);

    // Calcular progreso
    const totalSteps = TMERT_EVALUATION_CONFIG.steps.length;
    const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

    try {
      await this.evaluationService.updateEvaluation(id, {
        stepsData: updatedStepsData,
        currentStep: stepIndex,
        progress,
        status: 'in-progress',
      });
      console.log(`Step ${stepIndex} guardado exitosamente`);
    } catch (error) {
      console.error('Error saving step progress:', error);
    }
  }

  onFormCancel(): void {
    this.router.navigate(['/evaluations']);
  }

  /**
   * Callback cuando se crea el thread del chat
   */
  onThreadCreated(threadId: string): void {
    console.log('intentanto TMERT creado para evaluación:', threadId);

    this.threadId.set(threadId);
    console.log('Thread TMERT creado para evaluación:', threadId);
  }

  /**
   * Callback cuando se recibe un mensaje del asistente
   */
  onMessageReceived(message: ChatMessage): void {
    console.log('Mensaje recibido del asistente:', message);
    // Aquí puedes procesar respuestas especiales del asistente
    // Por ejemplo, si el asistente sugiere cambios en el formulario
  }

  /**
   * Callback cuando ocurre un error en el chat
   */
  onChatError(error: string): void {
    console.warn('Chat TMERT no disponible:', error);
    // No mostrar alert para no interrumpir al usuario
    // El chat mostrará el error en su propia UI
  }
}
