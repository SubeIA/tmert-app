import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  TableSkeletonComponent,
  ConfirmDialogComponent,
} from '@shared/components';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    DataTableComponent,
    TableSkeletonComponent,
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

  columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: 'Nombre',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user: User) => {
        const labels: Record<string, string> = {
          admin: 'Administrador',
          evaluator: 'Evaluador',
          viewer: 'Visualizador',
        };
        return labels[user.role || ''] || user.role || '-';
      },
      cellClass: (user: User) => `role-chip role-${user.role}`,
    },
    {
      key: 'companiesCount',
      header: 'Empresas Asignadas',
      render: (user: User) => (user.companyIds?.length || 0).toString(),
    },
  ];

  actions: TableAction<User>[] = [
    {
      icon: 'edit',
      label: 'Editar',
      color: 'primary',
      handler: (user: User) => this.openEditDialog(user),
    },
    {
      icon: 'delete',
      label: 'Eliminar',
      color: 'warn',
      handler: (user: User) => this.deleteUser(user),
    },
  ];

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      width: '520px',
      data: null,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const createData: CreateUserData = {
          email: result.email,
          password: result.password,
          name: result.name,
          role: result.role,
          companyIds: result.companies || [],
        };
        await this.createUser(createData);
      }
    });
  }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '520px',
      data: user,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const updateData: UpdateUserData = {
          userId: result.id,
          name: result.name,
          role: result.role,
          companyIds: result.companies || [],
        };
        await this.updateUser(updateData);
      }
    });
  }

  async createUser(data: CreateUserData) {
    this.loading.set(true);
    try {
      const response = await this.userManagement.createUser(data);
      this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
      await this.loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);

      let message = 'Error al crear usuario';

      if (error.code === 'functions/not-found') {
        message = 'Cloud Function no encontrada. Asegúrate de que las funciones estén desplegadas.';
      } else if (error.code === 'functions/unauthenticated') {
        message = 'No tienes permisos para crear usuarios.';
      } else if (error.message) {
        message = error.message;
      }

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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Usuario',
        message: `¿Estás seguro de que deseas eliminar al usuario <strong>${user.name}</strong>?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmColor: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) {
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
}
