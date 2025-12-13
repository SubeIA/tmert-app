import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Company, CreateCompanyDto } from '@models/company.model';
import {
  InputComponent,
  SelectComponent,
  TextareaComponent,
} from '@shared/components/form-controls';

@Component({
  selector: 'app-company-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    InputComponent,
    SelectComponent,
    TextareaComponent,
  ],
  templateUrl: './company-form-dialog.component.html',
  styleUrls: ['./company-form-dialog.component.scss'],
})
export class CompanyFormDialogComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<CompanyFormDialogComponent>);
  public data = inject<Company | null>(MAT_DIALOG_DATA);

  companyForm: FormGroup;
  isEditMode: boolean;

  constructor() {
    this.isEditMode = !!this.data;

    this.companyForm = this.fb.group({
      name: [this.data?.name || '', [Validators.required, Validators.minLength(3)]],
      rut: [this.data?.rut || '', [Validators.required]],
      address: [this.data?.address || ''],
      industry: [this.data?.industry || ''],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const formValue = this.companyForm.value;

    if (this.isEditMode && this.data) {
      this.dialogRef.close({
        ...this.data,
        ...formValue,
      });
    } else {
      this.dialogRef.close(formValue as CreateCompanyDto);
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.companyForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    return '';
  }
}
