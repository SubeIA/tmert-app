import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CreateThreadRequest,
  ThreadResponse,
  DeleteThreadResponse,
  AddMessageRequest,
  MessageResponse,
  MessageListResponse,
  RunAssistantRequest,
  RunResponse,
  ChatRequest,
  ChatResponse,
  CreateAssistantRequest,
  AssistantResponse,
  AssistantListResponse,
  UpdateAssistantRequest,
  DeleteAssistantResponse,
} from '../../models/tmert.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TmertService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.tmertApiUrl}/api/v1/tmert`;

  createThread(metadata?: Record<string, string>): Observable<ThreadResponse> {
    const request: CreateThreadRequest = { metadata };
    return this.http
      .post<ThreadResponse>(`${this.baseUrl}/threads`, request)
      .pipe(catchError(this.handleError));
  }

  getThread(threadId: string): Observable<ThreadResponse> {
    return this.http
      .get<ThreadResponse>(`${this.baseUrl}/threads/${threadId}`)
      .pipe(catchError(this.handleError));
  }

  deleteThread(threadId: string): Observable<DeleteThreadResponse> {
    return this.http
      .delete<DeleteThreadResponse>(`${this.baseUrl}/threads/${threadId}`)
      .pipe(catchError(this.handleError));
  }

  addMessage(
    threadId: string,
    content: string,
    role: 'user' | 'assistant' = 'user',
    fileIds?: string[]
  ): Observable<MessageResponse> {
    const request: AddMessageRequest = {
      thread_id: threadId,
      content,
      role,
      file_ids: fileIds,
    };
    return this.http
      .post<MessageResponse>(`${this.baseUrl}/messages`, request)
      .pipe(catchError(this.handleError));
  }

  listMessages(
    threadId: string,
    limit = 20,
    order: 'asc' | 'desc' = 'desc'
  ): Observable<MessageListResponse> {
    const params = new HttpParams().set('limit', limit.toString()).set('order', order);

    return this.http
      .get<MessageListResponse>(`${this.baseUrl}/threads/${threadId}/messages`, { params })
      .pipe(catchError(this.handleError));
  }

  runAssistant(
    threadId: string,
    assistantId: string,
    instructions?: string
  ): Observable<RunResponse> {
    const request: RunAssistantRequest = {
      thread_id: threadId,
      assistant_id: assistantId,
      instructions,
    };
    return this.http
      .post<RunResponse>(`${this.baseUrl}/runs`, request)
      .pipe(catchError(this.handleError));
  }

  getRunStatus(threadId: string, runId: string): Observable<RunResponse> {
    return this.http
      .get<RunResponse>(`${this.baseUrl}/threads/${threadId}/runs/${runId}`)
      .pipe(catchError(this.handleError));
  }

  chat(
    threadId: string,
    assistantId: string,
    message: string,
    waitForCompletion = true
  ): Observable<ChatResponse> {
    const request: ChatRequest = {
      thread_id: threadId,
      assistant_id: assistantId,
      message,
      wait_for_completion: waitForCompletion,
    };
    return this.http
      .post<ChatResponse>(`${this.baseUrl}/chat`, request)
      .pipe(catchError(this.handleError));
  }

  createAssistant(
    vectorStoreId?: string,
    temperature?: number,
    topP?: number
  ): Observable<AssistantResponse> {
    const request: CreateAssistantRequest = {
      vector_store_id: vectorStoreId,
      temperature,
      top_p: topP,
    };
    return this.http
      .post<AssistantResponse>(`${this.baseUrl}/assistants`, request)
      .pipe(catchError(this.handleError));
  }

  listAssistants(limit = 20): Observable<AssistantListResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<AssistantListResponse>(`${this.baseUrl}/assistants`, { params })
      .pipe(catchError(this.handleError));
  }

  getAssistant(assistantId: string): Observable<AssistantResponse> {
    return this.http
      .get<AssistantResponse>(`${this.baseUrl}/assistants/${assistantId}`)
      .pipe(catchError(this.handleError));
  }

  updateAssistant(
    assistantId: string,
    name?: string,
    instructions?: string,
    temperature?: number
  ): Observable<AssistantResponse> {
    const request: UpdateAssistantRequest = {
      assistant_id: assistantId,
      name,
      instructions,
      temperature,
    };
    return this.http
      .put<AssistantResponse>(`${this.baseUrl}/assistants`, request)
      .pipe(catchError(this.handleError));
  }

  deleteAssistant(assistantId: string): Observable<DeleteAssistantResponse> {
    return this.http
      .delete<DeleteAssistantResponse>(`${this.baseUrl}/assistants/${assistantId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: unknown): Observable<never> {
    console.error('Error en TMERT API:', error);
    let errorMessage = 'Ocurrió un error al comunicarse con el servicio TMERT';

    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;
      if (err['error'] && typeof err['error'] === 'object') {
        const errorObj = err['error'] as Record<string, unknown>;
        if (typeof errorObj['detail'] === 'string') {
          errorMessage = errorObj['detail'];
        } else if (typeof errorObj['message'] === 'string') {
          errorMessage = errorObj['message'];
        }
      } else if (typeof err['message'] === 'string') {
        errorMessage = err['message'];
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  pollRunStatus(
    threadId: string,
    runId: string,
    intervalMs = 1000,
    maxAttempts = 30
  ): Observable<RunResponse> {
    return new Observable(observer => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;

        this.getRunStatus(threadId, runId).subscribe({
          next: run => {
            if (run.status === 'completed') {
              clearInterval(interval);
              observer.next(run);
              observer.complete();
            } else if (
              run.status === 'failed' ||
              run.status === 'cancelled' ||
              run.status === 'expired'
            ) {
              clearInterval(interval);
              observer.error(new Error(`Run terminó con estado: ${run.status}`));
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              observer.error(new Error('Tiempo de espera agotado'));
            }
          },
          error: error => {
            clearInterval(interval);
            observer.error(error);
          },
        });
      }, intervalMs);
    });
  }
}
