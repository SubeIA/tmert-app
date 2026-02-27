import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

export interface TmertAiPayload {
  companyInfo: any;
  workstationInfo: any;
  initialAssessment: any;
}

export interface TmertAiResponse {
  success: boolean;
  analysis: {
    stage4?: {
      result: 'ACCEPTABLE' | 'NOT_ACCEPTABLE' | 'CRITICAL';
      justification: string;
      alerts?: string[];
    };
    stage5?: {
      measure: string;
      type: 'TECHNICAL' | 'ADMINISTRATIVE';
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      status?: 'PENDING' | 'COMPLETED';
      evidenceUrls?: string[];
    }[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private functions = inject(Functions);

  /**
   * Envía los datos de las Etapas 1-3 a la Cloud Function para obtener
   * los resultados automáticos de la Etapa 4 (Avanzada) y Etapa 5 (Plan de Acción).
   */
  async analyzeEvaluation(data: TmertAiPayload): Promise<TmertAiResponse> {
    try {
      const analyzeFn = httpsCallable<TmertAiPayload, TmertAiResponse>(
        this.functions,
        'analyzeTmertEvaluation'
      );

      const result = await analyzeFn(data);
      return result.data;
    } catch (error) {
      console.error('Error llamando a la función de IA analyzeTmertEvaluation:', error);
      throw error;
    }
  }
}
