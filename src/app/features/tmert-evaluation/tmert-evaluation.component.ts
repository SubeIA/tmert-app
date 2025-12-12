import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormStepperComponent } from '@shared/components/form-stepper/form-stepper.component';
import { TMERT_EVALUATION_CONFIG } from './tmert-evaluation.config';
import { EvaluationFirestoreService } from '@core/services/firestore/evaluation-firestore.service';

@Component({
  selector: 'app-tmert-evaluation',
  standalone: true,
  imports: [CommonModule, FormStepperComponent],
  templateUrl: './tmert-evaluation.component.html',
  styleUrl: './tmert-evaluation.component.scss',
})
export class TmertEvaluationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private evaluationService = inject(EvaluationFirestoreService);

  readonly formConfig = TMERT_EVALUATION_CONFIG;
  evaluationId = signal<string | null>(null);
  loading = signal(false);

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
        // TODO: Cargar datos del formulario si existen
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
}
