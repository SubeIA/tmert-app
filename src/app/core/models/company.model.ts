export interface Company {
  id: string;
  name: string;
  rut?: string;
  address?: string;
  industry?: string;
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
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}
