import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormStepperComponent } from '@shared/components/form-stepper/form-stepper.component';
import { TMERT_EVALUATION_CONFIG } from './tmert-evaluation.config';

@Component({
  selector: 'app-tmert-evaluation',
  standalone: true,
  imports: [CommonModule, FormStepperComponent],
  templateUrl: './tmert-evaluation.component.html',
  styleUrl: './tmert-evaluation.component.scss',
})
export class TmertEvaluationComponent {
  readonly formConfig = TMERT_EVALUATION_CONFIG;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFormSubmit(_formData: Record<string, unknown>): void {
    // TODO: Implementar lógica de guardado
    // Aquí puedes enviar los datos al backend
  }

  onFormCancel(): void {
    // TODO: Implementar lógica de cancelación
    // Puede mostrar un diálogo de confirmación o navegar a otra página
  }
}
