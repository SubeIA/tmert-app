import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from '@material/material.module';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ChatAssistantComponent } from '../chat-assistant/chat-assistant.component';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    MaterialModule,
    HeaderComponent,
    SidenavComponent,
    BreadcrumbComponent,
    ChatAssistantComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);

  sidenavOpened = signal(true);
  isMobile = signal(false);
  chatOpened = signal(false);

  sidenavMode = computed(() => (this.isMobile() ? 'over' : 'side'));

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result => {
      this.isMobile.set(result.matches);
      if (result.matches) {
        this.sidenavOpened.set(false);
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened.update(value => !value);
  }

  closeSidenavIfMobile(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  onChatToggle(isOpen: boolean): void {
    this.chatOpened.set(isOpen);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChatMessage(_message: string): void {
    // TODO: Integrar con servicio de IA/API
    // Aquí puedes llamar a tu backend o servicio de chat
  }

  onClearChat(): void {
    // TODO: Implementar lógica de limpieza si es necesario
  }
}
