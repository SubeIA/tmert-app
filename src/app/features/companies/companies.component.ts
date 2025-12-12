import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { Company, CreateCompanyDto } from '@models/company.model';
import { CompanyFormDialogComponent } from './company-form-dialog/company-form-dialog.component';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit {
  private companyService = inject(CompanyFirestoreService);
  private dialog = inject(MatDialog);

  companies = signal<Company[]>([]);
  loading = signal(false);
  displayedColumns: string[] = [
    'name',
    'rut',
    'industry',
    'contactName',
    'evaluatorsCount',
    'actions',
  ];

  async ngOnInit() {
    await this.loadCompanies();
  }

  async loadCompanies() {
    this.loading.set(true);
    try {
      const companies = await this.companyService.getAllCompanies();
      this.companies.set(companies);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CompanyFormDialogComponent, {
      width: '600px',
      data: null,
    });

    dialogRef.afterClosed().subscribe(async (result: CreateCompanyDto) => {
      if (result) {
        await this.createCompany(result);
      }
    });
  }

  openEditDialog(company: Company) {
    const dialogRef = this.dialog.open(CompanyFormDialogComponent, {
      width: '600px',
      data: company,
    });

    dialogRef.afterClosed().subscribe(async (result: Company) => {
      if (result) {
        await this.updateCompany(result);
      }
    });
  }

  async createCompany(data: CreateCompanyDto) {
    this.loading.set(true);
    try {
      await this.companyService.createCompany(data);
      await this.loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async updateCompany(company: Company) {
    this.loading.set(true);
    try {
      await this.companyService.updateCompany(company.id, company);
      await this.loadCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
