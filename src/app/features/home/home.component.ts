import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '@material/material.module';
import { AuthService } from '@core/services/auth/auth.service';
import { EvaluationFirestoreService } from '@core/services/firestore/evaluation-firestore.service';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { UserFirestoreService } from '@core/services/firestore/user-firestore.service';
import { TmertEvaluation } from '@core/models/evaluation.model';
import { Company } from '@core/models/company.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="home-container">
      <!-- Header Section -->
      <div class="welcome-section">
        <div class="welcome-overlay"></div>
        <div class="welcome-content">
          <h1>Bienvenido, {{ currentUser()?.name || 'Usuario' }}</h1>
          <p class="role-text">
            <mat-icon>badge</mat-icon>
            {{ getRoleLabel(currentUser()?.role) }}
          </p>
        </div>
        <button mat-flat-button class="new-evaluation-btn" (click)="goToEvaluations()">
          <mat-icon>add_circle</mat-icon>
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
        <div class="stats-section">
          <div class="section-header">
            <h2>Panel de Control</h2>
            <p>Resumen de tu actividad</p>
          </div>
          <div class="stats-grid">
            <mat-card class="stat-card primary">
              <div class="stat-header">
                <div class="stat-icon">
                  <mat-icon>assignment</mat-icon>
                </div>
                <div class="stat-content">
                  <h3>{{ totalEvaluations() }}</h3>
                  <p>Evaluaciones Totales</p>
                </div>
                <span class="stat-trend positive">
                  <mat-icon>trending_up</mat-icon>
                </span>
              </div>
              <div class="stat-footer">
                <span class="stat-detail">Total acumulado</span>
              </div>
            </mat-card>

            <mat-card class="stat-card danger">
              <div class="stat-header">
                <div class="stat-icon">
                  <mat-icon>pending_actions</mat-icon>
                </div>
                <div class="stat-content">
                  <h3>{{ inProgressEvaluations() }}</h3>
                  <p>En Progreso</p>
                </div>
                <span class="stat-trend">
                  <mat-icon>schedule</mat-icon>
                </span>
              </div>
              <div class="stat-footer">
                <span class="stat-detail">Requieren atención</span>
              </div>
            </mat-card>

            <mat-card class="stat-card success">
              <div class="stat-header">
                <div class="stat-icon">
                  <mat-icon>check_circle</mat-icon>
                </div>
                <div class="stat-content">
                  <h3>{{ completedEvaluations() }}</h3>
                  <p>Completadas</p>
                </div>
                <span class="stat-trend positive">
                  <mat-icon>done_all</mat-icon>
                </span>
              </div>
              <div class="stat-footer">
                <span class="stat-detail">Finalizadas con éxito</span>
              </div>
            </mat-card>

            <mat-card class="stat-card info">
              <div class="stat-header">
                <div class="stat-icon">
                  <mat-icon>business</mat-icon>
                </div>
                <div class="stat-content">
                  <h3>{{ totalCompanies() }}</h3>
                  <p>Empresas {{ isAdmin() ? 'Registradas' : 'Asignadas' }}</p>
                </div>
                <span class="stat-trend">
                  <mat-icon>business_center</mat-icon>
                </span>
              </div>
              <div class="stat-footer">
                <span class="stat-detail">En base de datos</span>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Quick Access Section -->
        <div class="quick-access-section">
          <div class="section-header">
            <h2>Acceso Rápido</h2>
            <p>Acciones más frecuentes</p>
          </div>
          <div class="quick-access-grid">
            <mat-card class="quick-access-card primary-card" (click)="goToEvaluations()">
              <div class="card-icon">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="card-content">
                <h3>Mis Evaluaciones</h3>
                <p>Ver y gestionar evaluaciones</p>
              </div>
              <div class="card-action">
                <mat-icon>arrow_forward</mat-icon>
              </div>
            </mat-card>

            <mat-card class="quick-access-card info-card" (click)="goToCompanies()">
              <div class="card-icon">
                <mat-icon>business</mat-icon>
              </div>
              <div class="card-content">
                <h3>Empresas</h3>
                <p>Gestionar empresas</p>
              </div>
              <div class="card-action">
                <mat-icon>arrow_forward</mat-icon>
              </div>
            </mat-card>

            @if (isAdmin()) {
              <mat-card class="quick-access-card success-card" (click)="goToUsers()">
                <div class="card-icon">
                  <mat-icon>people</mat-icon>
                </div>
                <div class="card-content">
                  <h3>Usuarios</h3>
                  <p>Administrar usuarios</p>
                </div>
                <div class="card-action">
                  <mat-icon>arrow_forward</mat-icon>
                </div>
              </mat-card>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        @if (recentEvaluations().length > 0) {
          <div class="recent-section">
            <div class="section-header">
              <h2>Actividad Reciente</h2>
              <p>Últimas evaluaciones</p>
            </div>
            <mat-card class="recent-card">
              <div class="recent-list">
                @for (evaluation of recentEvaluations(); track evaluation.id) {
                  <div
                    class="recent-item"
                    role="button"
                    tabindex="0"
                    (click)="goToEvaluation(evaluation.id)"
                    (keydown.enter)="goToEvaluation(evaluation.id)"
                    (keydown.space)="goToEvaluation(evaluation.id)"
                  >
                    <div class="recent-icon">
                      <mat-icon>assignment</mat-icon>
                    </div>
                    <div class="recent-content">
                      <h4>{{ evaluation.companyName }}</h4>
                      <p>
                        <span class="status-badge" [class]="'status-' + evaluation.status">
                          {{ getStatusLabel(evaluation.status) }}
                        </span>
                        <span class="progress-text">{{ evaluation.progress }}% completado</span>
                      </p>
                    </div>
                    <div class="recent-action">
                      <mat-icon>chevron_right</mat-icon>
                    </div>
                  </div>
                  @if (!$last) {
                    <mat-divider></mat-divider>
                  }
                }
              </div>
            </mat-card>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 0;
        max-width: 100%;
        margin: 0;
      }

      .welcome-section {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: -24px -24px 2rem;
        padding: 1.75rem 3rem;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        color: white;
        overflow: hidden;

        .welcome-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .welcome-content {
          position: relative;
          z-index: 1;

          h1 {
            margin: 0 0 8px;
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            color: white;
          }

          .role-text {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }
        }

        .new-evaluation-btn {
          position: relative;
          z-index: 1;
          background: white;
          color: #6366f1;
          font-weight: 600;
          font-size: 0.9375rem;
          padding: 0 28px;
          height: 48px;
          border-radius: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;

          mat-icon {
            margin-right: 8px;
            font-size: 22px;
            width: 22px;
            height: 22px;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
            background: #f8f9ff;
          }
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 80px 20px;
        color: #666;
      }

      .section-header {
        margin-bottom: 1.5rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 6px;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }

        p {
          margin: 0;
          font-size: 0.9375rem;
          color: #666;
          font-weight: 400;
        }
      }

      .stats-section {
        margin-bottom: 3rem;
        padding: 0 2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.5rem;
      }

      .stat-card {
        position: relative;
        padding: 1.25rem 1.5rem;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: default;
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.05);

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &.primary::before {
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        }

        &.danger::before {
          background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
        }

        &.success::before {
          background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
        }

        &.info::before {
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        }

        &:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);

          &::before {
            opacity: 1;
          }
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 0;
          width: 100%;

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(99, 102, 241, 0.1);

            mat-icon {
              font-size: 24px;
              width: 24px;
              height: 24px;
              color: #6366f1;
            }
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            color: #666;

            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }

            &.positive {
              color: #43e97b;
            }
          }
        }

        &.danger .stat-icon {
          background: rgba(240, 147, 251, 0.1);
          mat-icon {
            color: #f5576c;
          }
        }

        &.success .stat-icon {
          background: rgba(67, 233, 123, 0.1);
          mat-icon {
            color: #43e97b;
          }
        }

        &.info .stat-icon {
          background: rgba(79, 172, 254, 0.1);
          mat-icon {
            color: #4facfe;
          }
        }

        .stat-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-left: 1rem;

          h3 {
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1;
            letter-spacing: -0.02em;
          }

          p {
            margin: 0;
            font-size: 0.875rem;
            color: #666;
            font-weight: 600;
            letter-spacing: -0.01em;
            flex: 1;
          }
        }

        .stat-footer {
          position: absolute;
          bottom: 0.75rem;
          right: 1rem;
          margin: 0;
          padding: 0;
          border: none;

          .stat-detail {
            font-size: 0.75rem;
            color: #999;
            font-weight: 500;
          }
        }
      }

      .quick-access-section {
        margin-bottom: 3rem;
        padding: 0 2rem;
      }

      .quick-access-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .quick-access-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.05);

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 4px;
          transition: width 0.3s ease;
        }

        &.primary-card::before {
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
        }

        &.info-card::before {
          background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
        }

        &.success-card::before {
          background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%);
        }

        &:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

          &::before {
            width: 6px;
          }

          .card-action mat-icon {
            transform: translateX(4px);
          }
        }

        .card-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(99, 102, 241, 0.1);

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
            color: #6366f1;
          }
        }

        &.info-card .card-icon {
          background: rgba(79, 172, 254, 0.1);
          mat-icon {
            color: #4facfe;
          }
        }

        &.success-card .card-icon {
          background: rgba(67, 233, 123, 0.1);
          mat-icon {
            color: #43e97b;
          }
        }

        .card-content {
          flex: 1;

          h3 {
            margin: 0 0 4px;
            font-size: 1.0625rem;
            font-weight: 600;
            color: #1a1a1a;
            letter-spacing: -0.01em;
          }

          p {
            margin: 0;
            font-size: 0.8125rem;
            color: #666;
            font-weight: 400;
          }
        }

        .card-action {
          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: #999;
            transition: all 0.3s ease;
          }
        }
      }

      .recent-section {
        padding: 0 2rem 2rem;

        .recent-card {
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          padding: 0;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .recent-list {
          padding: 0;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: linear-gradient(90deg, rgba(99, 102, 241, 0.04) 0%, transparent 100%);

            .recent-action mat-icon {
              transform: translateX(4px);
              color: #6366f1;
            }
          }

          .recent-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(99, 102, 241, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            mat-icon {
              font-size: 24px;
              width: 24px;
              height: 24px;
              color: #6366f1;
            }
          }

          .recent-content {
            flex: 1;

            h4 {
              margin: 0 0 8px;
              font-size: 1rem;
              font-weight: 600;
              color: #1a1a1a;
              letter-spacing: -0.01em;
            }

            p {
              margin: 0;
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 0.875rem;
            }

            .status-badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.03em;

              &.status-draft {
                background: rgba(156, 163, 175, 0.15);
                color: #6b7280;
              }

              &.status-in-progress {
                background: rgba(245, 87, 108, 0.15);
                color: #f5576c;
              }

              &.status-completed {
                background: rgba(67, 233, 123, 0.15);
                color: #059669;
              }
            }

            .progress-text {
              color: #666;
              font-weight: 500;
            }
          }

          .recent-action {
            mat-icon {
              font-size: 24px;
              width: 24px;
              height: 24px;
              color: #ccc;
              transition: all 0.3s ease;
            }
          }
        }

        mat-divider {
          margin: 0;
        }
      }

      @media (max-width: 768px) {
        .welcome-section {
          margin: -24px -24px 1.5rem;
          padding: 2rem 1.5rem;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5rem;

          .welcome-content h1 {
            font-size: 2rem;
          }

          .new-evaluation-btn {
            width: 100%;
            justify-content: center;
          }
        }

        .stats-section,
        .quick-access-section,
        .recent-section {
          padding: 0 1rem;
        }

        .stats-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .quick-access-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .section-header h2 {
          font-size: 1.25rem;
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
  evaluations = signal<TmertEvaluation[]>([]);
  companies = signal<Company[]>([]);

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

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
