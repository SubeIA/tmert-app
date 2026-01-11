export interface TmertEvaluation {
  id: string;
  companyId: string;
  companyName: string;
  evaluatorId: string;
  evaluatorName: string;
  status: EvaluationStatus;
  progress: number;
  currentStep?: number;
  stepsData?: Record<string, Record<string, unknown>>;
  startDate?: Date;
  completedDate?: Date;
  data?: Record<string, unknown>;
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
}
