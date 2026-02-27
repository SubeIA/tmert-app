export interface WorkCenter {
  id: string;
  name: string;
  address: string;
  commune: string;
  totalWorkers: number;
}

export interface Responsible {
  name: string;
  role: string;
  contact: string;
}

export interface Company {
  id: string;
  name: string;
  rut?: string;
  address?: string;
  industry?: string;
  economicActivity?: string;
  ciiuCode?: string;
  centers?: WorkCenter[];
  responsible?: Responsible;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  evaluatorIds?: string[];
  evaluations?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type CompanyUpdate = Partial<Omit<Company, 'id' | 'createdAt'>>;

export interface CreateCompanyDto {
  name: string;
  rut?: string;
  address?: string;
  economicActivity?: string;
  ciiuCode?: string;
  centers?: WorkCenter[];
  responsible?: Responsible;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}
