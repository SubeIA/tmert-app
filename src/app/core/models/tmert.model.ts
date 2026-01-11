/**
 * Modelos para TMERT API - Threads y Asistentes
 */

// ==================== Thread Models ====================

export interface ThreadMetadata {
  user_id?: string;
  session_id?: string;
  nombre_usuario?: string;
  [key: string]: string | undefined;
}

export interface CreateThreadRequest {
  metadata?: ThreadMetadata;
}

export interface ThreadResponse {
  id: string;
  created_at: string;
  metadata?: ThreadMetadata;
}

export interface DeleteThreadResponse {
  success: boolean;
  message: string;
  thread_id: string;
}

// ==================== Message Models ====================

export interface MessageContent {
  type: string;
  text?: {
    value: string;
    annotations?: unknown[];
  };
}

export interface AddMessageRequest {
  thread_id: string;
  content: string;
  role?: 'user' | 'assistant';
  file_ids?: string[];
}

export interface MessageResponse {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface MessageListResponse {
  thread_id: string;
  messages: MessageResponse[];
  total: number;
}

// ==================== Run Models ====================

export interface RunAssistantRequest {
  thread_id: string;
  assistant_id: string;
  instructions?: string;
}

export interface RunResponse {
  id: string;
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'expired';
  created_at: string;
  completed_at?: string;
}

// ==================== Chat Models ====================

export interface ChatRequest {
  thread_id: string;
  assistant_id: string;
  message: string;
  wait_for_completion?: boolean;
}

export interface ChatResponse {
  thread_id: string;
  run_id: string;
  status: string;
  response?: string;
  message_id?: string;
  error?: string;
}

// ==================== Assistant Models ====================

export interface CreateAssistantRequest {
  vector_store_id?: string;
  temperature?: number;
  top_p?: number;
}

export interface AssistantResponse {
  id: string;
  name: string;
  model: string;
  created_at: string;
  instructions_preview?: string;
  tools?: string[];
  temperature?: number;
  top_p?: number;
  status?: string;
  created_by?: string;
}

export interface AssistantListItem {
  id: string;
  name: string;
  model: string;
  created_at: string;
}

export interface AssistantListResponse {
  assistants: AssistantListItem[];
  total: number;
}

export interface UpdateAssistantRequest {
  assistant_id: string;
  name?: string;
  instructions?: string;
  temperature?: number;
}

export interface DeleteAssistantResponse {
  success: boolean;
  message: string;
  assistant_id: string;
}
