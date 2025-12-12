import { Component, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_CONFIG } from './sidenav.data';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  private authService = inject(AuthService);
  itemClick = output<void>();

  sidebarConfig = SIDEBAR_CONFIG;

  // Filter menu items based on user role
  menuItems = computed(() => {
    const currentUser = this.authService.currentUser();
    const userRole = currentUser?.role;

    return SIDEBAR_NAV_ITEMS.filter(item => {
      // If item has no role restrictions, show it to everyone
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      // If user has no role, hide restricted items
      if (!userRole) {
        return false;
      }
      // Show item if user's role is in the allowed roles
      return item.roles.includes(userRole);
    });
  });

  onItemClick(): void {
    this.itemClick.emit();
  }
}
