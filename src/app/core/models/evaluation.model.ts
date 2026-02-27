export interface TmertEvaluation {
  id: string;
  companyId: string;
  centerId: string;
  companyName: string;
  evaluatorId: string;
  evaluatorName: string;
  status: EvaluationStatus;
  progress: number;
  currentStep?: number;
  stepsData?: Record<string, Record<string, unknown>>;
  /** Thread ID del asistente TMERT para esta evaluación */
  threadId?: string;
  startDate?: Date;
  completedDate?: Date;
  data?: Record<string, unknown>;

  /** Resultados de la Evaluación IA - Etapa 4 */
  stage4?: {
    result: 'ACCEPTABLE' | 'NOT_ACCEPTABLE' | 'CRITICAL';
    justification: string;
    alerts?: string[];
  };

  /** Resultados del Plan de Acción IA - Etapa 5 */
  stage5?: {
    measure: string;
    type: 'TECHNICAL' | 'ADMINISTRATIVE';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status?: 'PENDING' | 'COMPLETED';
    evidenceUrls?: string[];
  }[];

  createdAt?: Date;
  updatedAt?: Date;
}

export type EvaluationStatus = 'draft' | 'in-progress' | 'completed' | 'archived';

export type EvaluationUpdate = Partial<Omit<TmertEvaluation, 'id' | 'createdAt'>>;

export interface CreateEvaluationDto {
  companyId: string;
  companyName: string;
  evaluatorId: string;
  evaluatorName: string;
  initialData?: Record<string, unknown>;
  /** Thread ID del asistente TMERT (opcional, se creará automáticamente si no se provee) */
  threadId?: string;
}
