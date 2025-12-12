import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'evaluator' | 'viewer';
  companyIds?: string[];
}

export interface UpdateUserData {
  userId: string;
  name?: string;
  role?: 'admin' | 'evaluator' | 'viewer';
  companyIds?: string[];
}

export interface CloudFunctionResponse {
  success: boolean;
  message: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private functions = inject(Functions);

  async createUser(data: CreateUserData): Promise<CloudFunctionResponse> {
    try {
      const createUserFn = httpsCallable<CreateUserData, CloudFunctionResponse>(
        this.functions,
        'createUser'
      );

      const result = await createUserFn(data);
      return result.data;
    } catch (error: any) {
      console.error('Cloud Function Error Details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        fullError: error,
      });
      throw error;
    }
  }

  async updateUser(data: UpdateUserData): Promise<CloudFunctionResponse> {
    const updateUserFn = httpsCallable<UpdateUserData, CloudFunctionResponse>(
      this.functions,
      'updateUser'
    );

    const result = await updateUserFn(data);
    return result.data;
  }

  async deleteUser(userId: string): Promise<CloudFunctionResponse> {
    const deleteUserFn = httpsCallable<{ userId: string }, CloudFunctionResponse>(
      this.functions,
      'deleteUser'
    );

    const result = await deleteUserFn({ userId });
    return result.data;
  }
}
