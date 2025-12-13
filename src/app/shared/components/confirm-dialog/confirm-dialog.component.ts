import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <div class="header-icon" [class.warn-mode]="data.confirmColor === 'warn'">
          <mat-icon>{{ data.confirmColor === 'warn' ? 'warning' : 'help_outline' }}</mat-icon>
        </div>
        <div class="header-content">
          <h2>{{ data.title }}</h2>
        </div>
        <button mat-icon-button class="close-btn" (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <p [innerHTML]="data.message"></p>
      </mat-dialog-content>

      <mat-dialog-actions>
        <div class="actions-container">
          <button mat-stroked-button type="button" (click)="onCancel()" class="cancel-btn">
            <mat-icon>close</mat-icon>
            {{ data.cancelText || 'Cancelar' }}
          </button>
          <button
            mat-raised-button
            type="button"
            (click)="onConfirm()"
            [class.warn-btn]="data.confirmColor === 'warn'"
            [class.primary-btn]="data.confirmColor !== 'warn'"
          >
            <mat-icon>{{ data.confirmColor === 'warn' ? 'delete' : 'check' }}</mat-icon>
            {{ data.confirmText || 'Confirmar' }}
          </button>
        </div>
      </mat-dialog-actions>
    </div>
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
        max-width: 400px !important;
        width: 100% !important;
        overflow-x: hidden !important;
        border-radius: 6px !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
      }

      .dialog-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 24px 24px 16px;
        background: white;
        border-bottom: 3px solid #1976d2;
        position: relative;
        width: 100%;
        box-sizing: border-box;

        .header-icon {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          background: #1976d2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.warn-mode {
            background: #f44336;
          }

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: white;
          }
        }

        .header-content {
          flex: 1;

          h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            line-height: 1.3;
            color: #1a1a1a;
            letter-spacing: -0.02em;
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
        padding: 20px 24px;
        background: white;

        p {
          margin: 0;
          font-size: 0.9375rem;
          line-height: 1.6;
          color: #333;
        }

        ::ng-deep strong {
          color: #1a1a1a;
          font-weight: 600;
        }
      }

      mat-dialog-actions {
        padding: 16px 20px;
        border-top: 1px solid #e0e0e0;
        background: white;

        .actions-container {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          width: 100%;

          button {
            padding: 0 24px;
            height: 40px;
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
              background: white;
              color: #666;
              border: 2px solid #e0e0e0;

              &:hover {
                background: #f5f5f5;
                border-color: #ccc;
              }
            }

            &.warn-btn {
              background: #f44336;
              color: white;
              border: none;

              &:hover {
                background: #d32f2f;
              }
            }

            &.primary-btn {
              background: #1976d2;
              color: white;
              border: none;

              &:hover {
                background: #0d47a1;
              }
            }
          }
        }
      }

      @media (max-width: 768px) {
        .dialog-header {
          padding: 20px;

          .header-icon {
            width: 36px;
            height: 36px;

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
            }
          }

          .header-content h2 {
            font-size: 1.125rem;
          }
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
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
