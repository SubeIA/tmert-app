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
import { MatDialog } from '@angular/material/dialog';
import { EvaluationFirestoreService } from '@core/services/firestore/evaluation-firestore.service';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TmertEvaluation, EvaluationStatus } from '@models/evaluation.model';
import { SelectCompanyDialogComponent } from './select-company-dialog';
import {
  TableSkeletonComponent,
  DataTableComponent,
  TableColumn,
  TableAction,
} from '@shared/components';

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
    TableSkeletonComponent,
    DataTableComponent,
  ],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss'],
})
export class EvaluationsComponent implements OnInit {
  private evaluationService = inject(EvaluationFirestoreService);
  private companyService = inject(CompanyFirestoreService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  allEvaluations = signal<TmertEvaluation[]>([]);
  loading = signal(false);
  currentUser = computed(() => this.authService.currentUser());

  draftEvaluations = computed(() => this.allEvaluations().filter(e => e.status === 'draft'));
  inProgressEvaluations = computed(() =>
    this.allEvaluations().filter(e => e.status === 'in-progress')
  );
  completedEvaluations = computed(() =>
    this.allEvaluations().filter(e => e.status === 'completed')
  );

  columns: TableColumn<TmertEvaluation>[] = [
    {
      key: 'companyName',
      header: 'Empresa',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (evaluation: TmertEvaluation) => this.getStatusLabel(evaluation.status),
      cellClass: (evaluation: TmertEvaluation) => `status-chip status-${evaluation.status}`,
    },
    {
      key: 'progress',
      header: 'Progreso',
      render: (evaluation: TmertEvaluation) => `${evaluation.progress}%`,
    },
    {
      key: 'startDate',
      header: 'Fecha',
      render: (evaluation: TmertEvaluation) =>
        this.formatDate(evaluation.startDate || evaluation.createdAt),
    },
  ];

  inProgressActions: TableAction<TmertEvaluation>[] = [
    {
      icon: 'edit',
      label: 'Continuar',
      color: 'primary',
      handler: (evaluation: TmertEvaluation) => this.continueEvaluation(evaluation),
    },
  ];

  draftActions: TableAction<TmertEvaluation>[] = [
    {
      icon: 'play_arrow',
      label: 'Iniciar',
      color: 'accent',
      handler: (evaluation: TmertEvaluation) => this.continueEvaluation(evaluation),
    },
  ];

  completedActions: TableAction<TmertEvaluation>[] = [
    {
      icon: 'visibility',
      label: 'Ver',
      color: 'primary',
      handler: (evaluation: TmertEvaluation) => this.viewEvaluation(evaluation),
    },
  ];

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
    const dialogRef = this.dialog.open(SelectCompanyDialogComponent, {
      width: '500px',
      disableClose: false,
    });

    const company = await dialogRef.afterClosed().toPromise();

    if (!company) return;

    const user = this.currentUser();
    if (!user) return;

    this.loading.set(true);
    try {
      const evaluationId = await this.evaluationService.createEvaluation(
        company.id,
        company.name,
        user.id,
        user.name || user.email
      );

      const result = await this.router.navigate(['/tmert-evaluation', evaluationId]);

      if (!result) {
        alert('Error al navegar al formulario de evaluación');
      }
    } catch (error) {
      console.error('Error creating evaluation:', error);
      alert('Error al crear la evaluación. Por favor, intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
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
