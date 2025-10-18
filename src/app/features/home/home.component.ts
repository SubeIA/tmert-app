import { Component } from '@angular/core';
import { MaterialModule } from '@material/material.module';

@Component({
  selector: 'app-home',
  imports: [MaterialModule],
  template: `
    <mat-card class="main-card">
      <mat-card-header>
        <mat-icon mat-card-avatar color="primary">dashboard</mat-icon>
        <mat-card-title>Dashboard</mat-card-title>
        <mat-card-subtitle>Bienvenido a TMERT Asistente</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="placeholder-content">
          <mat-icon class="placeholder-icon">construction</mat-icon>
          <h2>Contenido en Desarrollo</h2>
          <p>
            Esta página está en construcción. Pronto tendrás acceso a las funcionalidades del
            dashboard.
          </p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .main-card {
        background: white;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        border-radius: 16px;
        margin: 0;
        border: 1px solid rgba(0, 0, 0, 0.06);

        mat-icon[mat-card-avatar] {
          background: var(--mat-sys-primary);
          color: white;
        }
      }

      .placeholder-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;

        .placeholder-icon {
          font-size: 80px;
          width: 80px;
          height: 80px;
          color: var(--mat-sys-outline);
          margin-bottom: 24px;
        }

        h2 {
          font-size: 24px;
          font-weight: 500;
          color: var(--mat-sys-on-surface);
          margin: 0 0 16px 0;
        }

        p {
          font-size: 16px;
          color: var(--mat-sys-on-surface-variant);
          margin: 0;
          max-width: 500px;
        }
      }
    `,
  ],
})
export class HomeComponent {}
