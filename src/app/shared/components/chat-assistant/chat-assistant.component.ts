/* eslint-disable no-console */
import { Component, Input, Output, EventEmitter, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Subject, takeUntil } from 'rxjs';
import { TmertService } from '@core/services/tmert/tmert.service';
import { ThreadResponse } from '@core/models/tmert.model';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    TextFieldModule,
  ],
  templateUrl: './chat-assistant.component.html',
  styleUrl: './chat-assistant.component.scss',
})
export class ChatAssistantComponent implements OnDestroy {
  private readonly tmertService = inject(TmertService);
  private readonly destroy$ = new Subject<void>();

  @Input() title = 'Asistente TMERT';
  @Input() placeholder = 'Escribe tu pregunta...';
  @Input() assistantId = 'asst_YOUR_ASSISTANT_ID'; // ID del asistente
  @Input() userId?: string; // ID del usuario
  @Input() evaluationId?: string; // ID de la evaluación (opcional para contexto)
  @Input() companyId?: string; // ID de la empresa (opcional para contexto)

  @Output() threadCreated = new EventEmitter<string>();
  @Output() messageReceived = new EventEmitter<ChatMessage>();
  @Output() errorOccurred = new EventEmitter<string>();

  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  inputMessage = '';
  threadId = signal<string | null>(null);
  error = signal<string | null>(null);

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

    // Construir metadata con información contextual
    const metadata: Record<string, string> = {
      session_id: `session-${Date.now()}`,
    };

    if (this.userId) {
      metadata['user_id'] = this.userId;
    }
    if (this.evaluationId) {
      metadata['evaluation_id'] = this.evaluationId;
    }
    if (this.companyId) {
      metadata['company_id'] = this.companyId;
    }

    this.tmertService
      .createThread(metadata)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (thread: ThreadResponse) => {
          this.threadId.set(thread.id);
          this.isLoading.set(false);
          this.threadCreated.emit(thread.id);
          console.log('Thread TMERT creado:', thread.id);
        },
        error: err => {
          const errorMsg =
            '⚠️ El asistente TMERT no está disponible en este momento. Por favor, verifica que el servicio esté corriendo.';
          this.error.set(errorMsg);
          this.isLoading.set(false);
          this.errorOccurred.emit(errorMsg);
          console.warn('Chat TMERT no disponible:', err.message);
        },
      });
  }

  /**
   * Envía un mensaje al asistente usando el servicio TMERT
   */
  onSendMessage(): void {
    const message = this.inputMessage.trim();
    if (!message || this.isLoading()) {
      return;
    }

    // Si no hay thread, inicializar primero
    if (!this.threadId()) {
      this.initializeThread();
      // Esperar a que se cree el thread antes de enviar
      setTimeout(() => {
        if (this.threadId()) {
          this.sendMessageToAssistant(message);
        }
      }, 1000);
      return;
    }

    this.sendMessageToAssistant(message);
  }

  /**
   * Envía el mensaje al asistente una vez que el thread está listo
   */
  private sendMessageToAssistant(message: string): void {
    if (!this.threadId()) {
      return;
    }

    // Agregar mensaje del usuario a la UI
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.inputMessage = '';
    this.isLoading.set(true);
    this.error.set(null);

    // Enviar mensaje usando el servicio TMERT
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
            const assistantMessage: ChatMessage = {
              id: response.message_id || `assistant-${Date.now()}`,
              role: 'assistant',
              content: response.response,
              timestamp: new Date(),
            };

            this.messages.update(msgs => [...msgs, assistantMessage]);
            this.messageReceived.emit(assistantMessage);
          } else if (response.error) {
            const errorMsg = 'Error del asistente: ' + response.error;
            this.error.set(errorMsg);
            this.errorOccurred.emit(errorMsg);
          }
          this.isLoading.set(false);
        },
        error: err => {
          const errorMsg = '⚠️ No se pudo enviar el mensaje. El servicio TMERT no está disponible.';
          this.error.set(errorMsg);
          this.isLoading.set(false);
          this.errorOccurred.emit(errorMsg);
          console.warn('No se pudo enviar mensaje al asistente:', err.message);
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
            id: msg.id,
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

  /**
   * Método legacy para compatibilidad - ya no emite eventos externos
   * @deprecated Use onSendMessage() directamente
   */
  addAssistantMessage(content: string): void {
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };

    this.messages.update(msgs => [...msgs, assistantMessage]);
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  onClearChat(): void {
    this.messages.set([]);
    this.error.set(null);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  onSuggestionClick(suggestion: string): void {
    this.inputMessage = suggestion;
    this.onSendMessage();
  }
}
