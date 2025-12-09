export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role?: 'admin' | 'evaluator' | 'viewer';
  companyIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt'>>;
