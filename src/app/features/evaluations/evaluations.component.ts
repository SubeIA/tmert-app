import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EvaluationFirestoreService } from '@core/services/firestore/evaluation-firestore.service';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TmertEvaluation, EvaluationStatus } from '@models/evaluation.model';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
  ],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss'],
})
export class EvaluationsComponent implements OnInit {
  private evaluationService = inject(EvaluationFirestoreService);
  private companyService = inject(CompanyFirestoreService);
  private authService = inject(AuthService);
  private router = inject(Router);

  allEvaluations = signal<TmertEvaluation[]>([]);
  loading = signal(false);
  currentUser = computed(() => this.authService.currentUser());

  displayedColumns: string[] = ['company', 'status', 'progress', 'startDate', 'actions'];

  draftEvaluations = computed(() => this.allEvaluations().filter(e => e.status === 'draft'));
  inProgressEvaluations = computed(() =>
    this.allEvaluations().filter(e => e.status === 'in-progress')
  );
  completedEvaluations = computed(() =>
    this.allEvaluations().filter(e => e.status === 'completed')
  );

  async ngOnInit() {
    await this.loadEvaluations();
  }

  async loadEvaluations() {
    const user = this.currentUser();
    if (!user) return;

    this.loading.set(true);
    try {
      const evaluations = await this.evaluationService.getEvaluationsByEvaluator(user.id);
      this.allEvaluations.set(evaluations);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async createNewEvaluation() {
    // TODO: Abrir diálogo para seleccionar empresa y crear evaluación
  }

  continueEvaluation(evaluation: TmertEvaluation) {
    this.router.navigate(['/tmert-evaluation', evaluation.id]);
  }

  viewEvaluation(evaluation: TmertEvaluation) {
    this.router.navigate(['/tmert-evaluation', evaluation.id], {
      queryParams: { readonly: true },
    });
  }

  getStatusColor(status: EvaluationStatus): string {
    const colors = {
      draft: 'accent',
      'in-progress': 'primary',
      completed: 'primary',
      archived: 'default',
    };
    return colors[status] || 'default';
  }

  getStatusLabel(status: EvaluationStatus): string {
    const labels = {
      draft: 'Borrador',
      'in-progress': 'En Progreso',
      completed: 'Completada',
      archived: 'Archivada',
    };
    return labels[status] || status;
  }

  formatDate(date?: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CL');
  }
}
