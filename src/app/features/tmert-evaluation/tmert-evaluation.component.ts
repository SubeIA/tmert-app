import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormStepperComponent } from '@shared/components/form-stepper/form-stepper.component';
import { FloatingChatComponent } from '@shared/components/floating-chat/floating-chat.component';
import { TMERT_EVALUATION_CONFIG } from './tmert-evaluation.config';
import { EvaluationFirestoreService } from '@core/services/firestore/evaluation-firestore.service';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { FormStepperConfig } from '@shared/models/form-field.model';

@Component({
  selector: 'app-tmert-evaluation',
  standalone: true,
  imports: [CommonModule, FormStepperComponent, FloatingChatComponent],
  templateUrl: './tmert-evaluation.component.html',
  styleUrl: './tmert-evaluation.component.scss',
})
export class TmertEvaluationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private evaluationService = inject(EvaluationFirestoreService);
  private companyService = inject(CompanyFirestoreService);

  evaluationId = signal<string | null>(null);
  companyId = signal<string | null>(null);
  companyName = signal<string>('');
  companyRut = signal<string>('');
  loading = signal(false);

  get formConfig(): FormStepperConfig {
    const config = { ...TMERT_EVALUATION_CONFIG };
    config.steps = config.steps.map(step => {
      if (step.label === 'Unidades Empresa / Identificación') {
        return {
          ...step,
          fields:
            step.fields?.map(field => {
              if (field.name === 'entidad_nombre') {
                return { ...field, value: this.companyName(), disabled: true };
              }
              if (field.name === 'entidad_rut') {
                return { ...field, value: this.companyRut(), disabled: true };
              }
              return field;
            }) || [],
        };
      }
      return step;
    });
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

  async loadEvaluation(id: string) {
    this.loading.set(true);
    try {
      const evaluation = await this.evaluationService.getEvaluation(id);
      if (evaluation) {
        this.companyId.set(evaluation.companyId);
        this.companyName.set(evaluation.companyName);

        // Cargar RUT desde la empresa
        const company = await this.companyService.getCompany(evaluation.companyId);
        if (company?.rut) {
          this.companyRut.set(company.rut);
        }

        // TODO: Cargar otros datos del formulario si existen
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
      await this.evaluationService.updateEvaluation(id, {
        data: _formData,
        status: 'in-progress',
        progress: 50,
      });
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Error al guardar la evaluación');
    } finally {
      this.loading.set(false);
    }
  }

  onFormCancel(): void {
    this.router.navigate(['/evaluations']);
  }

  onChatMessage(message: string): void {
    console.log('Chat message:', message);
    // TODO: Implementar integración con servicio de chat/IA
  }
}
