/* eslint-disable no-console */
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TmertService } from '../../core/services/tmert/tmert.service';
import { ThreadResponse } from '../../core/models/tmert.model';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Ejemplo de componente que utiliza TmertService
 *
 * Funcionalidad:
 * - Crea un thread al inicializar
 * - Envía mensajes del usuario al asistente
 * - Muestra respuestas del asistente en tiempo real
 * - Mantiene historial de conversación
 */
@Component({
  selector: 'app-tmert-chat-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2>TMERT Assistant Chat</h2>
        @if (threadId()) {
          <span class="thread-id">Thread: {{ threadId() }}</span>
        }
      </div>

      <div class="messages-container">
        @for (message of messages(); track $index) {
          <div
            class="message"
            [class.user]="message.role === 'user'"
            [class.assistant]="message.role === 'assistant'"
          >
            <div class="message-role">{{ message.role === 'user' ? 'Tú' : 'Asistente' }}</div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ message.timestamp | date: 'short' }}</div>
          </div>
        }

        @if (isLoading()) {
          <div class="message assistant loading">
            <div class="message-role">Asistente</div>
            <div class="message-content">Escribiendo...</div>
          </div>
        }
      </div>

      <div class="input-container">
        <input
          type="text"
          [(ngModel)]="userMessage"
          (keyup.enter)="sendMessage()"
          [disabled]="isLoading() || !threadId()"
          placeholder="Escribe tu mensaje..."
          class="message-input"
        />
        <button
          (click)="sendMessage()"
          [disabled]="isLoading() || !userMessage.trim() || !threadId()"
          class="send-button"
        >
          Enviar
        </button>
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }
    </div>
  `,
  styles: [
    `
      .chat-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-width: 800px;
        margin: 0 auto;
        background: #f5f5f5;
      }

      .chat-header {
        padding: 1.5rem;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .chat-header h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .thread-id {
        font-size: 0.8125rem;
        opacity: 0.9;
        font-family: monospace;
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .message {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 12px;
        max-width: 70%;
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message.user {
        align-self: flex-end;
        background: #6366f1;
        color: white;
      }

      .message.assistant {
        align-self: flex-start;
        background: white;
        color: #1e293b;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .message.loading {
        opacity: 0.7;
      }

      .message-role {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .message.user .message-role {
        color: rgba(255, 255, 255, 0.9);
      }

      .message.assistant .message-role {
        color: #6366f1;
      }

      .message-content {
        font-size: 0.9375rem;
        line-height: 1.6;
        word-wrap: break-word;
      }

      .message-time {
        font-size: 0.6875rem;
        opacity: 0.7;
        align-self: flex-end;
      }

      .input-container {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        background: white;
        border-top: 1px solid #e2e8f0;
      }

      .message-input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.9375rem;
        transition: all 0.2s ease;
      }

      .message-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .message-input:disabled {
        background: #f1f5f9;
        cursor: not-allowed;
      }

      .send-button {
        padding: 0.75rem 1.5rem;
        background: #6366f1;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .send-button:hover:not(:disabled) {
        background: #4f46e5;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .send-button:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
        transform: none;
      }

      .error-message {
        padding: 1rem;
        margin: 1rem;
        background: #fee2e2;
        color: #dc2626;
        border-radius: 8px;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class TmertChatExampleComponent implements OnInit, OnDestroy {
  private readonly tmertService = inject(TmertService);
  private readonly destroy$ = new Subject<void>();

  // Signals para estado del componente
  threadId = signal<string | null>(null);
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Propiedades
  userMessage = '';
  assistantId = 'asst_YOUR_ASSISTANT_ID'; // Reemplazar con el ID real del asistente

  ngOnInit(): void {
    this.initializeThread();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa un nuevo thread para la conversación
   */
  private initializeThread(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.tmertService
      .createThread({
        user_id: 'user-123', // Obtener del servicio de auth
        session_id: `session-${Date.now()}`,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (thread: ThreadResponse) => {
          this.threadId.set(thread.id);
          this.isLoading.set(false);
          console.log('Thread creado:', thread);
        },
        error: err => {
          this.error.set('Error al crear el thread: ' + err.message);
          this.isLoading.set(false);
          console.error('Error creando thread:', err);
        },
      });
  }

  /**
   * Envía un mensaje al asistente
   */
  sendMessage(): void {
    const message = this.userMessage.trim();
    if (!message || !this.threadId() || this.isLoading()) {
      return;
    }

    // Agregar mensaje del usuario a la UI
    this.messages.update(msgs => [
      ...msgs,
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
      },
    ]);

    this.userMessage = '';
    this.isLoading.set(true);
    this.error.set(null);

    // Enviar mensaje usando el método simplificado chat()
    this.tmertService
      .chat(
        this.threadId()!,
        this.assistantId,
        message,
        true // Esperar respuesta completa
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response.status === 'completed' && response.response) {
            // Agregar respuesta del asistente a la UI
            this.messages.update(msgs => [
              ...msgs,
              {
                role: 'assistant',
                content: response.response!,
                timestamp: new Date(),
              },
            ]);
          } else if (response.error) {
            this.error.set('Error del asistente: ' + response.error);
          }
          this.isLoading.set(false);
        },
        error: err => {
          this.error.set('Error al enviar mensaje: ' + err.message);
          this.isLoading.set(false);
          console.error('Error enviando mensaje:', err);
        },
      });
  }

  /**
   * Carga el historial de mensajes del thread
   */
  loadMessageHistory(): void {
    if (!this.threadId()) return;

    this.tmertService
      .listMessages(this.threadId()!, 50, 'asc')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          const chatMessages: ChatMessage[] = response.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          this.messages.set(chatMessages);
        },
        error: err => {
          console.error('Error cargando historial:', err);
        },
      });
  }
}
