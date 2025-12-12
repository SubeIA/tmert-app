import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { Company, CreateCompanyDto } from '@models/company.model';
import { CompanyFormDialogComponent } from './company-form-dialog/company-form-dialog.component';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  TableSkeletonComponent,
} from '@shared/components';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    DataTableComponent,
    TableSkeletonComponent,
  ],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit {
  private companyService = inject(CompanyFirestoreService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  companies = signal<Company[]>([]);
  loading = signal(false);

  columns: TableColumn<Company>[] = [
    {
      key: 'name',
      header: 'Empresa',
      width: '25%',
      render: row => row.name,
    },
    {
      key: 'rut',
      header: 'RUT',
      width: '15%',
      render: row => row.rut || '-',
    },
    {
      key: 'industry',
      header: 'Industria',
      width: '20%',
      render: row => row.industry || '-',
    },
    {
      key: 'contactName',
      header: 'Contacto',
      width: '20%',
      render: row => {
        if (row.contactName) {
          return row.contactEmail ? `${row.contactName} (${row.contactEmail})` : row.contactName;
        }
        return '-';
      },
    },
    {
      key: 'evaluatorIds',
      header: 'Evaluadores',
      width: '10%',
      render: row => row.evaluatorIds?.length || 0,
      cellClass: 'text-center',
    },
  ];

  actions: TableAction<Company>[] = [
    {
      icon: 'edit',
      label: 'Editar',
      color: 'primary',
      tooltip: 'Editar empresa',
      handler: row => this.openEditDialog(row),
    },
    {
      icon: 'person_add',
      label: 'Asignar evaluadores',
      color: 'accent',
      tooltip: 'Asignar evaluadores',
      handler: row => this.navigateToAssignEvaluators(row),
    },
  ];

  async ngOnInit() {
    await this.loadCompanies();
  }

  async loadCompanies() {
    this.loading.set(true);
    try {
      // Delay de 2 segundos para probar el skeleton
      await new Promise(resolve => setTimeout(resolve, 2000));

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

  navigateToAssignEvaluators(company: Company) {
    this.router.navigate(['/companies', company.id, 'assign-evaluators']);
  }
}
