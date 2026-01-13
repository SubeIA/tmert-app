/* eslint-disable no-console */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
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
export class ChatAssistantComponent implements OnInit, OnDestroy, AfterViewChecked {
  private readonly tmertService = inject(TmertService);
  private readonly destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  @Input() title = 'Asistente TMERT';
  @Input() placeholder = 'Escribe tu pregunta...';
  @Input() assistantId = 'asst_YOUR_ASSISTANT_ID'; // ID del asistente
  @Input() userId?: string; // ID del usuario
  @Input() evaluationId?: string; // ID de la evaluación (opcional para contexto)
  @Input() companyId?: string; // ID de la empresa (opcional para contexto)
  /** Thread ID existente para continuar una conversación */
  @Input() existingThreadId?: string;

  @Output() threadCreated = new EventEmitter<string>();
  @Output() messageReceived = new EventEmitter<ChatMessage>();
  @Output() errorOccurred = new EventEmitter<string>();

  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  isLoadingHistory = signal(false);
  inputMessage = '';
  threadId = signal<string | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Si hay un threadId existente, usarlo y cargar mensajes
    if (this.existingThreadId) {
      this.threadId.set(this.existingThreadId);
      console.log('Usando thread existente de la evaluación:', this.existingThreadId);
      this.loadExistingMessages();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Hace scroll al final del contenedor de mensajes
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.warn('Error al hacer scroll:', err);
    }
  }

  /**
   * Marca que se debe hacer scroll al final
   */
  private triggerScrollToBottom(): void {
    this.shouldScrollToBottom = true;
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
   * Carga los mensajes existentes de un thread
   */
  private loadExistingMessages(): void {
    const currentThreadId = this.threadId();
    if (!currentThreadId) return;

    this.isLoadingHistory.set(true);

    this.tmertService
      .listMessages(currentThreadId, 50, 'asc')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          console.log('Respuesta de mensajes:', response);
          const loadedMessages: ChatMessage[] = response.messages
            .filter(msg => msg.content && msg.content.trim() !== '') // Filtrar mensajes vacíos
            .map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: this.parseTimestamp(msg.created_at),
            }));

          this.messages.set(loadedMessages);
          this.isLoadingHistory.set(false);
          this.triggerScrollToBottom();
          console.log(`Cargados ${loadedMessages.length} mensajes del thread`);
        },
        error: err => {
          console.warn('No se pudieron cargar mensajes anteriores:', err.message);
          this.isLoadingHistory.set(false);
          // No mostrar error, simplemente continuar sin mensajes previos
        },
      });
  }

  /**
   * Parsea el timestamp del backend a Date
   * El backend envía timestamps en segundos como string
   */
  private parseTimestamp(timestamp: string | number): Date {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    // Si el timestamp es en segundos (menos de 10 dígitos típicamente indica segundos)
    // lo convertimos a milisegundos
    if (ts < 10000000000) {
      return new Date(ts * 1000);
    }
    return new Date(ts);
  }

  /**
   * Envía un mensaje al asistente usando el servicio TMERT
   */
  onSendMessage(): void {
    const message = this.inputMessage.trim();
    if (!message || this.isLoading()) {
      return;
    }

    // Si no hay thread, crear uno nuevo (solo para evaluaciones sin thread)
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
    this.triggerScrollToBottom();

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
            this.triggerScrollToBottom();
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

  /**
   * Formatea el contenido del mensaje para mostrar markdown básico como HTML
   */
  formatMessage(content: string): string {
    if (!content) return '';

    let formatted = content;

    // Escapar HTML para seguridad
    formatted = formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Bloques de código (```)
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Código inline (`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers (### ## #)
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold (**text** o __text__)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic (*text* o _text_)
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Listas no ordenadas (- item o * item)
    formatted = formatted.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Listas ordenadas (1. item)
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Blockquotes (> text)
    formatted = formatted.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Links [text](url)
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

    // Horizontal rules (---)
    formatted = formatted.replace(/^---$/gm, '<hr>');

    // Convertir doble salto de línea en párrafos
    formatted = formatted.replace(/\n\n/g, '</p><p>');

    // Convertir saltos de línea simples en <br> (excepto dentro de listas/pre)
    formatted = formatted.replace(/\n/g, '<br>');

    // Limpiar <br> innecesarios después de elementos de bloque
    formatted = formatted.replace(/<\/li><br>/g, '</li>');
    formatted = formatted.replace(/<\/ul><br>/g, '</ul>');
    formatted = formatted.replace(/<\/ol><br>/g, '</ol>');
    formatted = formatted.replace(/<\/pre><br>/g, '</pre>');
    formatted = formatted.replace(/<\/h[1-6]><br>/g, match => match.replace('<br>', ''));
    formatted = formatted.replace(/<\/blockquote><br>/g, '</blockquote>');
    formatted = formatted.replace(/<hr><br>/g, '<hr>');

    return formatted;
  }
}
