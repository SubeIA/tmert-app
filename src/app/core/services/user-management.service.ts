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

/**
 * Service to interact with Cloud Functions for user management.
 * These functions allow admins to create, update, and delete users
 * without logging out of their own session.
 */
@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private functions = inject(Functions);

  /**
   * Creates a new user using Cloud Function.
   * Only admins can call this.
   */
  async createUser(data: CreateUserData): Promise<CloudFunctionResponse> {
    const createUserFn = httpsCallable<CreateUserData, CloudFunctionResponse>(
      this.functions,
      'createUser'
    );

    const result = await createUserFn(data);
    return result.data;
  }

  /**
   * Updates an existing user using Cloud Function.
   * Only admins can call this.
   */
  async updateUser(data: UpdateUserData): Promise<CloudFunctionResponse> {
    const updateUserFn = httpsCallable<UpdateUserData, CloudFunctionResponse>(
      this.functions,
      'updateUser'
    );

    const result = await updateUserFn(data);
    return result.data;
  }

  /**
   * Deletes a user using Cloud Function.
   * Only admins can call this.
   */
  async deleteUser(userId: string): Promise<CloudFunctionResponse> {
    const deleteUserFn = httpsCallable<{ userId: string }, CloudFunctionResponse>(
      this.functions,
      'deleteUser'
    );

    const result = await deleteUserFn({ userId });
    return result.data;
  }
}
