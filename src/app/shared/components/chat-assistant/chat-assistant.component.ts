import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
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
export class ChatAssistantComponent {
  @Input() title = 'Asistente TMERT';
  @Input() placeholder = 'Escribe tu pregunta...';
  @Input() isOpen = false;

  @Output() sendMessage = new EventEmitter<string>();
  @Output() togglePanel = new EventEmitter<boolean>();
  @Output() clearChat = new EventEmitter<void>();

  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  inputMessage = '';

  onTogglePanel(): void {
    this.isOpen = !this.isOpen;
    this.togglePanel.emit(this.isOpen);
  }

  onSendMessage(): void {
    if (!this.inputMessage.trim() || this.isLoading()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: this.inputMessage.trim(),
      timestamp: new Date(),
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.sendMessage.emit(this.inputMessage.trim());
    this.inputMessage = '';
  }

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
    this.clearChat.emit();
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
