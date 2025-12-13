import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@models/user.model';
import { Company } from '@models/company.model';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import {
  InputComponent,
  SelectComponent,
  type SelectOption,
} from '@shared/components/form-controls';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss'],
})
export class UserFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyFirestore = inject(CompanyFirestoreService);
  private dialogRef = inject(MatDialogRef<UserFormDialogComponent>);

  data = inject<User | null>(MAT_DIALOG_DATA);

  userForm!: FormGroup;
  companies = signal<Company[]>([]);
  isEditMode = !!this.data;

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'evaluator', label: 'Evaluador' },
    { value: 'viewer', label: 'Visualizador' },
  ];

  async ngOnInit() {
    this.buildForm();
    await this.loadCompanies();
  }

  buildForm() {
    this.userForm = this.fb.group({
      id: [this.data?.id || ''],
      email: [
        { value: this.data?.email || '', disabled: this.isEditMode },
        [Validators.required, Validators.email],
      ],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      name: [this.data?.name || '', Validators.required],
      role: [this.data?.role || 'evaluator', Validators.required],
      companies: [this.data?.companyIds || []],
    });
  }

  async loadCompanies() {
    try {
      const companies = await this.companyFirestore.getAllCompanies();
      this.companies.set(companies);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }

  companyOptions = computed<SelectOption[]>(() => {
    return this.companies().map(company => ({
      value: company.id,
      label: company.name,
    }));
  });

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();

      if (this.isEditMode && !formValue.password) {
        delete formValue.password;
      }

      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getDialogTitle(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Crear Usuario';
  }
}
