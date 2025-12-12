import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';
import { CompanyFirestoreService } from '@core/services/firestore/company-firestore.service';
import { UserFirestoreService } from '@core/services/firestore/user-firestore.service';
import { Company } from '@models/company.model';
import { User } from '@models/user.model';

@Component({
  selector: 'app-assign-evaluators',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './assign-evaluators.component.html',
  styleUrls: ['./assign-evaluators.component.scss'],
})
export class AssignEvaluatorsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyFirestoreService);
  private userService = inject(UserFirestoreService);

  companyId = signal<string>('');
  company = signal<Company | null>(null);
  availableEvaluators = signal<User[]>([]);
  loading = signal(false);
  selection = new SelectionModel<string>(true, []);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.companyId.set(id);
      await this.loadData();
    }
  }

  async loadData() {
    this.loading.set(true);
    try {
      const company = await this.companyService.getCompany(this.companyId());
      this.company.set(company);

      // TODO: Implementar getAllEvaluators en UserFirestoreService
      // Por ahora mostramos array vacío
      this.availableEvaluators.set([]);

      // Pre-select already assigned evaluators
      if (company?.evaluatorIds) {
        this.selection.select(...company.evaluatorIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  isSelected(evaluatorId: string): boolean {
    return this.selection.isSelected(evaluatorId);
  }

  toggleEvaluator(evaluatorId: string) {
    this.selection.toggle(evaluatorId);
  }

  async saveAssignments() {
    this.loading.set(true);
    try {
      const currentIds = this.company()?.evaluatorIds || [];
      const newIds = this.selection.selected;

      const added = newIds.filter(id => !currentIds.includes(id));
      const removed = currentIds.filter(id => !newIds.includes(id));

      for (const evaluatorId of added) {
        await this.companyService.addEvaluatorToCompany(this.companyId(), evaluatorId);
        await this.userService.addCompanyToUser(evaluatorId, this.companyId());
      }

      for (const evaluatorId of removed) {
        await this.companyService.removeEvaluatorFromCompany(this.companyId(), evaluatorId);
        await this.userService.removeCompanyFromUser(evaluatorId, this.companyId());
      }

      this.router.navigate(['/companies']);
    } catch (error) {
      console.error('Error saving assignments:', error);
    } finally {
      this.loading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/companies']);
  }
}
