import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableColumnConfig } from '@shared/models/form-field.model';
import { FloatingChatComponent } from '@shared/components/floating-chat/floating-chat.component';
import { CameraService } from '@core/services/camera/camera.service';

export interface RowEditDialogData {
  columns: TableColumnConfig[];
  rowData: Record<string, unknown> | null;
  isNew: boolean;
  rowIndex?: number;
  /** Configuración del chat */
  chatConfig?: {
    enabled: boolean;
    evaluationId?: string;
    companyId?: string;
    userId?: string;
  };
  allowPhotos?: boolean;
}

export interface RowEditDialogResult {
  data: Record<string, unknown>;
  isNew: boolean;
  rowIndex?: number;
}

@Component({
  selector: 'app-row-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    FloatingChatComponent,
  ],
  templateUrl: './row-edit-dialog.component.html',
  styleUrl: './row-edit-dialog.component.scss',
})
export class RowEditDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RowEditDialogComponent>);
  public data: RowEditDialogData = inject(MAT_DIALOG_DATA);
  private cameraService = inject(CameraService);

  form!: FormGroup;
  photos: string[] = [];

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const group: Record<string, unknown[]> = {};

    this.data.columns.forEach(column => {
      const validators = column.required ? [Validators.required] : [];

      let defaultValue: unknown = '';
      if (column.type === 'number') {
        defaultValue = null;
      } else if (column.type === 'checkbox') {
        defaultValue = false;
      }

      // Si hay datos existentes, usar esos valores
      if (this.data.rowData && this.data.rowData[column.name] !== undefined) {
        defaultValue = this.data.rowData[column.name];
      }

      group[column.name] = [defaultValue, validators];
    });

    this.form = this.fb.group(group);

    if (this.data.allowPhotos) {
      if (this.data.rowData && Array.isArray(this.data.rowData['evidenceUrls'])) {
        this.photos = [...this.data.rowData['evidenceUrls']];
      }
    }
  }

  get dialogTitle(): string {
    return this.data.isNew ? 'Agregar Registro' : 'Editar Registro';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const resultData = { ...this.form.value };
      if (this.data.allowPhotos) {
        resultData['evidenceUrls'] = this.photos;
      }

      const result: RowEditDialogResult = {
        data: resultData,
        isNew: this.data.isNew,
        rowIndex: this.data.rowIndex,
      };
      this.dialogRef.close(result);
    } else {
      this.form.markAllAsTouched();
    }
  }

  async takePhoto(): Promise<void> {
    const photo = await this.cameraService.takePhoto();
    if (photo && photo.dataUrl) {
      this.photos.push(photo.dataUrl);
    }
  }

  removePhoto(index: number): void {
    this.photos.splice(index, 1);
  }
}
