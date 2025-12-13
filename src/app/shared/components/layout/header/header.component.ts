import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth/auth.service';
import { COMMON_UI } from '@core/constants/ui/common.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  authService = inject(AuthService);

  menuToggle = output<void>();

  readonly UI = COMMON_UI;

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string | undefined): string {
    if (!role) return 'Usuario';
    const labels: Record<string, string> = {
      admin: 'Administrador',
      evaluator: 'Evaluador',
      viewer: 'Visualizador',
    };
    return labels[role] || role;
  }
}
