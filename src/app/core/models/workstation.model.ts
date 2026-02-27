export interface Hierarchy {
  area: string;
  workstation: string;
  task: string;
}

export interface TaskDetails {
  schedule: string;
  overtime: number;
  exposedWorkers: {
    male: number;
    female: number;
  };
  contractType: string;
  remuneration: string;
  taskDurationMinutes: number;
  pauses: string;
  rotation: boolean;
}

export interface ActionPlanItem {
  id?: string;
  measure: string;
  responsible: string;
  deadline?: Date;
  status: 'PENDING' | 'COMPLETED';
  evidenceUrls?: string[];
}

export interface RiskFactor {
  factorType:
    | 'UPPER_LIMB_REPETITIVE'
    | 'STATIC_POSTURE'
    | 'MANUAL_HANDLING'
    | 'PATIENT_HANDLING'
    | 'WHOLE_BODY_VIBRATION'
    | 'HAND_ARM_VIBRATION';
  initialAssessment: Record<string, boolean>;
  requiresAdvanced: boolean;
  advancedAssessment?: {
    result: 'ACCEPTABLE' | 'NOT_ACCEPTABLE' | 'CRITICAL';
    details?: Record<string, unknown>;
  };
  actionPlan: ActionPlanItem[];
}

export interface Workstation {
  id: string;
  evaluationId: string;
  hierarchy: Hierarchy;
  details: TaskDetails;
  environment: string;
  createdAt?: Date;
  updatedAt?: Date;
}
