import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { AuthService } from '@core/services/auth/auth.service';
import { Company } from '@models/company.model';
import { SelectComponent, type SelectOption } from '@shared/components/form-controls';

@Component({
  selector: 'app-select-company-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SelectComponent,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-icon">
        <mat-icon>assignment_add</mat-icon>
      </div>
      <div class="header-content">
        <h2>Nueva Evaluación TMERT</h2>
        <p class="subtitle">Selecciona la empresa a evaluar</p>
      </div>
      <button mat-icon-button class="close-btn" (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      @if (loading()) {
        <div class="loading-container">
          <mat-icon class="loading-icon">hourglass_empty</mat-icon>
          <p>Cargando empresas...</p>
        </div>
      } @else if (availableCompanies().length === 0) {
        <div class="empty-state">
          <mat-icon>business_center</mat-icon>
          <p>No hay empresas disponibles para evaluar.</p>
          <p class="hint">Contacta al administrador para que te asigne empresas.</p>
        </div>
      } @else {
        <form [formGroup]="companyForm" class="select-company-form">
          <app-select
            formControlName="companyId"
            label="Empresa"
            [options]="companyOptions()"
            appearance="outline"
            [required]="true"
            prefixIcon="business"
            hint="Selecciona la empresa a evaluar"
          ></app-select>

          @if (companyForm.get('companyId')?.value) {
            <div class="company-info">
              <div class="info-item">
                <mat-icon>business</mat-icon>
                <span><strong>RUT:</strong> {{ getSelectedCompany()?.rut }}</span>
              </div>
              <div class="info-item">
                <mat-icon>category</mat-icon>
                <span><strong>Industria:</strong> {{ getSelectedCompany()?.industry }}</span>
              </div>
              <div class="info-item">
                <mat-icon>place</mat-icon>
                <span><strong>Dirección:</strong> {{ getSelectedCompany()?.address }}</span>
              </div>
            </div>
          }
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions>
      <div class="actions-container">
        <button mat-stroked-button type="button" (click)="onCancel()" class="cancel-btn">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button
          mat-raised-button
          type="button"
          [disabled]="!companyForm.valid || loading()"
          (click)="onConfirm()"
          class="submit-btn"
        >
          <mat-icon>add_task</mat-icon>
          Crear Evaluación
        </button>
      </div>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 100%;
        overflow: hidden;
      }

      ::ng-deep .mat-mdc-dialog-container {
        max-width: calc(100vw - 64px) !important;
        overflow-x: hidden !important;
        padding: 0 !important;
      }

      ::ng-deep .mat-mdc-dialog-surface {
        max-width: 520px !important;
        width: 100% !important;
        overflow-x: hidden !important;
        border-radius: 6px !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
      }

      .dialog-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 32px 32px 24px;
        background: white;
        border-bottom: 3px solid #1976d2;
        position: relative;
        width: 100%;
        box-sizing: border-box;

        .header-icon {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          background: #1976d2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
            color: white;
          }
        }

        .header-content {
          flex: 1;

          h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            line-height: 1.3;
            color: #1a1a1a;
            letter-spacing: -0.02em;
          }

          .subtitle {
            margin: 6px 0 0;
            font-size: 0.875rem;
            color: #666;
            font-weight: 400;
          }
        }

        .close-btn {
          color: #666;
          transition: all 0.2s;

          &:hover {
            color: #1a1a1a;
            background: #f5f5f5;
          }
        }
      }

      mat-dialog-content {
        width: 100%;
        max-width: calc(100vw - 64px);
        max-height: calc(80vh - 200px);
        overflow-y: auto;
        overflow-x: hidden;
        padding: 24px 32px;
        background: white;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 0;

          &:hover {
            background: #999;
          }
        }
      }

      .select-company-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
        width: 100%;

        app-select {
          width: 100%;
          display: block;
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
        gap: 16px;
        color: #666;

        .loading-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #1976d2;
          animation: spin 2s linear infinite;
        }

        p {
          margin: 0;
          font-size: 0.9375rem;
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: rgba(0, 0, 0, 0.3);
          margin-bottom: 1rem;
        }

        p {
          margin: 8px 0;
          font-size: 1rem;
          color: #666;
        }

        .hint {
          font-size: 0.875rem;
          color: #999;
        }
      }

      .company-info {
        margin-top: 8px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 4px solid #1976d2;

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 12px 0;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: #1976d2;
          }

          span {
            font-size: 0.875rem;
            color: #333;

            strong {
              color: #1a1a1a;
              font-weight: 600;
            }
          }
        }
      }

      mat-dialog-actions {
        padding: 20px 24px;
        border-top: 1px solid #e0e0e0;
        background: white;

        .actions-container {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          width: 100%;

          button {
            padding: 0 28px;
            height: 42px;
            border-radius: 2px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.875rem;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }

            &.cancel-btn {
              background: #dc3545;
              color: white;
              border: 2px solid #dc3545;

              &:hover:not([disabled]) {
                background: #c82333;
                border-color: #c82333;
              }
            }

            &.submit-btn {
              background: #1976d2;
              color: white;
              border: none;

              &:hover:not([disabled]) {
                background: #0d47a1;
              }

              &:disabled {
                background: #e0e0e0;
                color: #999;
              }
            }
          }
        }
      }

      @media (max-width: 768px) {
        .dialog-header {
          padding: 20px;

          .header-icon {
            width: 40px;
            height: 40px;

            mat-icon {
              font-size: 24px;
              width: 24px;
              height: 24px;
            }
          }

          .header-content h2 {
            font-size: 1.25rem;
          }
        }

        mat-dialog-content {
          padding: 16px;
        }

        mat-dialog-actions .actions-container {
          flex-direction: column;

          button {
            width: 100%;
          }
        }
      }
    `,
  ],
})
export class SelectCompanyDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<SelectCompanyDialogComponent>);
  private companyService = inject(CompanyFirestoreService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  availableCompanies = signal<Company[]>([]);
  loading = signal(false);
  companyForm!: FormGroup;

  companyOptions = computed<SelectOption[]>(() => {
    return this.availableCompanies().map(company => ({
      value: company.id,
      label: `${company.name} - ${company.rut}`,
    }));
  });

  async ngOnInit() {
    this.buildForm();
    await this.loadCompanies();
  }

  buildForm() {
    this.companyForm = this.fb.group({
      companyId: ['', Validators.required],
    });
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
    const companyId = this.companyForm.get('companyId')?.value;
    return this.availableCompanies().find(c => c.id === companyId);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (!this.companyForm.valid) return;

    const company = this.getSelectedCompany();
    if (company) {
      this.dialogRef.close(company);
    }
  }
}
