import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserFirestoreService } from '@core/services/firestore/user-firestore.service';
import {
  UserManagementService,
  CreateUserData,
  UpdateUserData,
} from '@core/services/user-management.service';
import { User } from '@models/user.model';
import { UserFormDialogComponent } from './user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private userFirestore = inject(UserFirestoreService);
  private userManagement = inject(UserManagementService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users = signal<User[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['name', 'email', 'role', 'companiesCount', 'actions'];

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    try {
      const users = await this.userFirestore.getAllUsers();
      this.users.set(users);
    } catch (error) {
      console.error('Error loading users:', error);
      this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: null,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        await this.createUser(result);
      }
    });
  }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: user,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        await this.updateUser(result);
      }
    });
  }

  async createUser(data: CreateUserData) {
    this.loading.set(true);
    try {
      const response = await this.userManagement.createUser(data);
      this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
      await this.loadUsers();
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      const message = error instanceof Error ? error.message : 'Error al crear usuario';
      this.snackBar.open(message, 'Cerrar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async updateUser(data: UpdateUserData) {
    this.loading.set(true);
    try {
      const response = await this.userManagement.updateUser(data);
      this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
      await this.loadUsers();
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
      this.snackBar.open(message, 'Cerrar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async deleteUser(user: User) {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${user.name}?`)) {
      return;
    }

    this.loading.set(true);
    try {
      const response = await this.userManagement.deleteUser(user.id);
      this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
      await this.loadUsers();
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
      this.snackBar.open(message, 'Cerrar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      evaluator: 'Evaluador',
      viewer: 'Visualizador',
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): 'primary' | 'accent' | 'warn' {
    const colors: Record<string, 'primary' | 'accent' | 'warn'> = {
      admin: 'warn',
      evaluator: 'primary',
      viewer: 'accent',
    };
    return colors[role] || 'primary';
  }
}
