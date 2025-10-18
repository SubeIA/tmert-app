import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_CONFIG, NavItem } from './sidenav.data';

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
  itemClick = output<void>();

  menuItems: readonly NavItem[] = SIDEBAR_NAV_ITEMS;
  sidebarConfig = SIDEBAR_CONFIG;

  onItemClick(): void {
    this.itemClick.emit();
  }
}
