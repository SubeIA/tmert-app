import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '@material/material.module';
import { AuthService } from '@core/services/auth/auth.service';
import { EvaluationFirestoreService } from '@core/services/firestore/evaluation-firestore.service';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { UserFirestoreService } from '@core/services/firestore/user-firestore.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="home-container">
      <!-- Header Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1>Bienvenido, {{ currentUser()?.name || 'Usuario' }}</h1>
          <p>{{ getRoleLabel(currentUser()?.role) }}</p>
        </div>
        <button mat-raised-button color="primary" (click)="goToEvaluations()">
          <mat-icon>assignment</mat-icon>
          Nueva Evaluación
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando información...</p>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div
              class="stat-icon"
              style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
            >
              <mat-icon>assignment</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ totalEvaluations() }}</h3>
              <p>Evaluaciones Totales</p>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div
              class="stat-icon"
              style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"
            >
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ inProgressEvaluations() }}</h3>
              <p>En Progreso</p>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div
              class="stat-icon"
              style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"
            >
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ completedEvaluations() }}</h3>
              <p>Completadas</p>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div
              class="stat-icon"
              style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);"
            >
              <mat-icon>business</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ totalCompanies() }}</h3>
              <p>Empresas {{ isAdmin() ? 'Registradas' : 'Asignadas' }}</p>
            </div>
          </mat-card>
        </div>

        <!-- Quick Access Section -->
        <div class="quick-access-section">
          <h2>Acceso Rápido</h2>
          <div class="quick-access-grid">
            <mat-card class="quick-access-card" (click)="goToEvaluations()">
              <mat-icon>assignment</mat-icon>
              <h3>Mis Evaluaciones</h3>
              <p>Ver y gestionar evaluaciones</p>
            </mat-card>

            <mat-card class="quick-access-card" (click)="goToCompanies()">
              <mat-icon>business</mat-icon>
              <h3>Empresas</h3>
              <p>Gestionar empresas</p>
            </mat-card>

            @if (isAdmin()) {
              <mat-card class="quick-access-card" (click)="goToUsers()">
                <mat-icon>people</mat-icon>
                <h3>Usuarios</h3>
                <p>Administrar usuarios</p>
              </mat-card>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        @if (recentEvaluations().length > 0) {
          <div class="recent-section">
            <h2>Actividad Reciente</h2>
            <mat-card>
              <mat-list>
                @for (evaluation of recentEvaluations(); track evaluation.id) {
                  <mat-list-item (click)="goToEvaluation(evaluation.id)">
                    <mat-icon matListItemIcon>assignment</mat-icon>
                    <div matListItemTitle>{{ evaluation.companyName }}</div>
                    <div matListItemLine>
                      {{ getStatusLabel(evaluation.status) }} - {{ evaluation.progress }}%
                    </div>
                    <mat-icon matListItemMeta>arrow_forward</mat-icon>
                  </mat-list-item>
                  <mat-divider></mat-divider>
                }
              </mat-list>
            </mat-card>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .welcome-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        color: white;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);

        .welcome-content {
          h1 {
            margin: 0;
            font-size: 2rem;
            font-weight: 600;
            letter-spacing: -0.5px;
          }

          p {
            margin: 8px 0 0;
            font-size: 1.125rem;
            opacity: 0.9;
          }
        }

        button {
          background: white;
          color: #667eea;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

          mat-icon {
            margin-right: 8px;
          }
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 60px;
        color: #666;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        cursor: default;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            color: white;
          }
        }

        .stat-content {
          h3 {
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1;
          }

          p {
            margin: 8px 0 0;
            font-size: 0.875rem;
            color: #666;
            font-weight: 500;
          }
        }
      }

      .quick-access-section {
        margin-bottom: 2rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: #1a1a1a;
        }
      }

      .quick-access-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .quick-access-card {
        padding: 2rem 1.5rem;
        text-align: center;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.05) 0%,
            rgba(118, 75, 162, 0.05) 100%
          );
        }

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #667eea;
          margin-bottom: 1rem;
        }

        h3 {
          margin: 0 0 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: #666;
        }
      }

      .recent-section {
        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: #1a1a1a;
        }

        mat-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        mat-list-item {
          cursor: pointer;
          transition: background 0.2s ease;

          &:hover {
            background: #f8f9fa;
          }
        }
      }

      @media (max-width: 768px) {
        .home-container {
          padding: 1rem;
        }

        .welcome-section {
          flex-direction: column;
          gap: 1rem;
          text-align: center;

          .welcome-content h1 {
            font-size: 1.5rem;
          }
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }

        .quick-access-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private evaluationService = inject(EvaluationFirestoreService);
  private companyService = inject(CompanyFirestoreService);
  private userService = inject(UserFirestoreService);
  private router = inject(Router);

  loading = signal(false);
  evaluations = signal<any[]>([]);
  companies = signal<any[]>([]);

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  totalEvaluations = computed(() => this.evaluations().length);
  inProgressEvaluations = computed(
    () => this.evaluations().filter(e => e.status === 'in-progress').length
  );
  completedEvaluations = computed(
    () => this.evaluations().filter(e => e.status === 'completed').length
  );
  totalCompanies = computed(() => this.companies().length);
  recentEvaluations = computed(() => this.evaluations().slice(0, 5));

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const user = this.currentUser();
    if (!user) return;

    this.loading.set(true);
    try {
      const [evaluations, companies] = await Promise.all([
        this.evaluationService.getEvaluationsByEvaluator(user.id),
        this.isAdmin()
          ? this.companyService.getAllCompanies()
          : this.companyService.getCompaniesByEvaluator(user.id),
      ]);

      this.evaluations.set(evaluations);
      this.companies.set(companies);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getRoleLabel(role: string | undefined): string {
    if (!role) return 'Usuario';
    const labels: Record<string, string> = {
      admin: 'Administrador',
      evaluator: 'Evaluador',
      viewer: 'Visualizador',
    };
    return labels[role] || role;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      'in-progress': 'En Progreso',
      completed: 'Completada',
    };
    return labels[status] || status;
  }

  goToEvaluations() {
    this.router.navigate(['/evaluations']);
  }

  goToCompanies() {
    this.router.navigate(['/companies']);
  }

  goToUsers() {
    this.router.navigate(['/users']);
  }

  goToEvaluation(id: string) {
    this.router.navigate(['/tmert-evaluation', id]);
  }
}
