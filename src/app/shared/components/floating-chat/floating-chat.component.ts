import { Component, Input, Output, EventEmitter, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ChatAssistantComponent, ChatMessage } from '../chat-assistant/chat-assistant.component';

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule, ChatAssistantComponent],
  template: `
    <div class="floating-chat-container">
      @if (isOpen()) {
        <div class="chat-window">
          <app-chat-assistant
            [title]="title"
            [placeholder]="placeholder"
            [assistantId]="assistantId"
            [userId]="userId"
            [evaluationId]="evaluationId"
            [companyId]="companyId"
            [existingThreadId]="threadId"
            (threadCreated)="onThreadCreated($event)"
            (messageReceived)="onMessageReceived($event)"
            (errorOccurred)="onErrorOccurred($event)"
          ></app-chat-assistant>
        </div>
      }

      <button
        mat-fab
        class="chat-fab"
        [class.open]="isOpen()"
        (click)="toggleChat()"
        color="primary"
        [matBadge]="unreadCount()"
        [matBadgeHidden]="unreadCount() === 0 || isOpen()"
        matBadgePosition="above before"
      >
        @if (isOpen()) {
          <mat-icon>close</mat-icon>
        } @else {
          <mat-icon>chat</mat-icon>
        }
      </button>
    </div>
  `,
  styles: [
    `
      .floating-chat-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 1000;
      }

      .chat-window {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 400px;
        max-width: calc(100vw - 48px);
        height: 600px;
        max-height: calc(100vh - 150px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        animation: slideUp 0.3s ease-out;

        ::ng-deep app-chat-assistant {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
        }
        50% {
          box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        }
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .chat-fab {
        width: 72px;
        height: 72px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        box-shadow: 0 6px 24px rgba(102, 126, 234, 0.6);
        transition: all 0.3s ease;
        animation:
          pulse 2s infinite,
          float 3s ease-in-out infinite;
        border: 3px solid white;

        &:hover {
          transform: translateY(-10px) scale(1.15);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.8);
          animation: none;
        }

        &.open {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
          animation: none;

          &:hover {
            background: linear-gradient(135deg, #c82333 0%, #bd2130 100%) !important;
            box-shadow: 0 12px 32px rgba(220, 53, 69, 0.6);
          }
        }

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
      }

      @media (max-width: 768px) {
        .floating-chat-container {
          bottom: 16px;
          right: 16px;
        }

        .chat-window {
          bottom: 100px;
          right: 16px;
          width: calc(100vw - 32px);
          height: calc(100vh - 140px);
        }

        .chat-fab {
          width: 64px;
          height: 64px;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }
      }
    `,
  ],
})
export class FloatingChatComponent {
  @ViewChild(ChatAssistantComponent) chatAssistant?: ChatAssistantComponent;

  @Input() title = 'Asistente TMERT';
  @Input() placeholder = 'Escribe tu pregunta...';
  @Input() assistantId = 'asst_YOUR_ASSISTANT_ID'; // ID del asistente TMERT
  @Input() userId?: string; // ID del usuario actual
  @Input() evaluationId?: string; // ID de la evaluación
  @Input() companyId?: string; // ID de la empresa
  /** Thread ID existente para continuar conversación */
  @Input() threadId?: string;

  @Output() threadCreated = new EventEmitter<string>();
  @Output() messageReceived = new EventEmitter<ChatMessage>();
  @Output() errorOccurred = new EventEmitter<string>();

  isOpen = signal(false);
  unreadCount = signal(0);

  toggleChat(): void {
    this.isOpen.update(open => !open);
    if (this.isOpen()) {
      this.unreadCount.set(0);
    }
  }

  onThreadCreated(threadId: string): void {
    this.threadCreated.emit(threadId);
  }

  onMessageReceived(message: ChatMessage): void {
    this.messageReceived.emit(message);
    if (!this.isOpen()) {
      this.unreadCount.update(count => count + 1);
    }
  }

  onErrorOccurred(error: string): void {
    this.errorOccurred.emit(error);
  }

  /**
   * @deprecated Método legacy - el componente ahora gestiona mensajes internamente
   */
  addAssistantMessage(content: string): void {
    this.chatAssistant?.addAssistantMessage(content);
    if (!this.isOpen()) {
      this.unreadCount.update(count => count + 1);
    }
  }

  /**
   * @deprecated Método legacy - el componente ahora gestiona el loading internamente
   */
  setLoading(loading: boolean): void {
    this.chatAssistant?.setLoading(loading);
  }
}
