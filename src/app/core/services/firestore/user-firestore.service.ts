import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from '@angular/fire/firestore';
import { User } from '@models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserFirestoreService {
  private firestore = inject(Firestore);
  private readonly USERS_COLLECTION = 'users';

  async createUserDocument(
    userId: string,
    email: string,
    name: string,
    role: 'admin' | 'evaluator' | 'viewer' = 'evaluator'
  ): Promise<void> {
    const userRef = doc(this.firestore, this.USERS_COLLECTION, userId);

    const userData: Record<string, unknown> = {
      id: userId,
      email,
      name,
      role,
      companyIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userData);
  }

  async getUserData(userId: string): Promise<User | null> {
    try {
      const userRef = doc(this.firestore, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return {
        id: userSnap.id,
        email: data['email'],
        name: data['name'],
        photoURL: data['photoURL'],
        role: data['role'] || 'evaluator',
        companyIds: data['companyIds'] || [],
        createdAt: data['createdAt']?.toDate(),
        updatedAt: data['updatedAt']?.toDate(),
      } as User;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async addCompanyToUser(userId: string, companyId: string): Promise<void> {
    const userRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      companyIds: arrayUnion(companyId),
      updatedAt: serverTimestamp(),
    });
  }

  async removeCompanyFromUser(userId: string, companyId: string): Promise<void> {
    const userRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      companyIds: arrayRemove(companyId),
      updatedAt: serverTimestamp(),
    });
  }

  async deleteUserDocument(userId: string): Promise<void> {
    const userRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  }
}
