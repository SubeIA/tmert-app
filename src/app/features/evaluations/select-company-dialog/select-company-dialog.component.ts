import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { AuthService } from '@core/services/auth/auth.service';
import { Company } from '@models/company.model';

@Component({
  selector: 'app-select-company-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva Evaluación TMERT</h2>

    <mat-dialog-content>
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando empresas...</p>
        </div>
      } @else if (availableCompanies().length === 0) {
        <div class="empty-state">
          <p>No hay empresas disponibles para evaluar.</p>
          <p class="hint">Contacta al administrador para que te asigne empresas.</p>
        </div>
      } @else {
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Seleccionar Empresa</mat-label>
          <mat-select [(ngModel)]="selectedCompanyId">
            @for (company of availableCompanies(); track company.id) {
              <mat-option [value]="company.id"> {{ company.name }} - {{ company.rut }} </mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (selectedCompanyId) {
          <div class="company-info">
            <p><strong>Contacto:</strong> {{ getSelectedCompany()?.contactName }}</p>
            <p><strong>Email:</strong> {{ getSelectedCompany()?.contactEmail }}</p>
            <p><strong>Industria:</strong> {{ getSelectedCompany()?.industry }}</p>
          </div>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!selectedCompanyId || loading()"
        (click)="onConfirm()"
      >
        Crear Evaluación
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 400px;
        padding: 20px 24px;
      }

      .full-width {
        width: 100%;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
        gap: 16px;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #666;

        .hint {
          font-size: 0.9em;
          color: #999;
          margin-top: 8px;
        }
      }

      .company-info {
        margin-top: 16px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;

        p {
          margin: 8px 0;
          font-size: 0.9em;

          strong {
            color: #333;
          }
        }
      }

      mat-dialog-actions {
        padding: 16px 24px;
      }
    `,
  ],
})
export class SelectCompanyDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<SelectCompanyDialogComponent>);
  private companyService = inject(CompanyFirestoreService);
  private authService = inject(AuthService);

  availableCompanies = signal<Company[]>([]);
  loading = signal(false);
  selectedCompanyId: string | null = null;

  async ngOnInit() {
    await this.loadCompanies();
  }

  async loadCompanies() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.loading.set(true);
    try {
      const allCompanies = await this.companyService.getAllCompanies();
      const filtered = allCompanies.filter(company => {
        return company.evaluatorIds?.includes(user.id);
      });

      if (user.role === 'admin' || filtered.length === 0) {
        this.availableCompanies.set(allCompanies);
      } else {
        this.availableCompanies.set(filtered);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getSelectedCompany(): Company | undefined {
    return this.availableCompanies().find(c => c.id === this.selectedCompanyId);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (!this.selectedCompanyId) return;

    const company = this.getSelectedCompany();
    if (company) {
      this.dialogRef.close(company);
    }
  }
}
