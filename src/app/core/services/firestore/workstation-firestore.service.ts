import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from '@angular/fire/firestore';
import { Workstation } from '@models/workstation.model';

@Injectable({
  providedIn: 'root',
})
export class WorkstationFirestoreService {
  private firestore = inject(Firestore);

  private getWorkstationCollectionRef(evaluationId: string) {
    return collection(this.firestore, `tmert_evaluations/${evaluationId}/workstations`);
  }

  async createWorkstation(
    evaluationId: string,
    workstationData: Omit<Workstation, 'id' | 'evaluationId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const wsRef = doc(this.getWorkstationCollectionRef(evaluationId));

    const data: Record<string, unknown> = {
      id: wsRef.id,
      evaluationId,
      ...workstationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(wsRef, data);
    return wsRef.id;
  }

  async getWorkstation(evaluationId: string, workstationId: string): Promise<Workstation | null> {
    try {
      const wsRef = doc(
        this.firestore,
        `tmert_evaluations/${evaluationId}/workstations`,
        workstationId
      );
      const wsSnap = await getDoc(wsRef);

      if (!wsSnap.exists()) {
        return null;
      }

      const data = wsSnap.data();
      return {
        id: wsSnap.id,
        evaluationId: data['evaluationId'],
        hierarchy: data['hierarchy'],
        details: data['details'],
        environment: data['environment'],
        createdAt: data['createdAt']?.toDate(),
        updatedAt: data['updatedAt']?.toDate(),
      } as Workstation;
    } catch (error) {
      console.error('Error getting workstation:', error);
      return null;
    }
  }

  async updateWorkstation(
    evaluationId: string,
    workstationId: string,
    updates: Partial<Workstation>
  ): Promise<void> {
    const wsRef = doc(
      this.firestore,
      `tmert_evaluations/${evaluationId}/workstations`,
      workstationId
    );
    await updateDoc(wsRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async getAllWorkstations(evaluationId: string): Promise<Workstation[]> {
    try {
      const querySnapshot = await getDocs(this.getWorkstationCollectionRef(evaluationId));

      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          evaluationId: data['evaluationId'],
          hierarchy: data['hierarchy'],
          details: data['details'],
          environment: data['environment'],
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate(),
        } as Workstation;
      });
    } catch (error) {
      console.error('Error getting all workstations:', error);
      return [];
    }
  }

  async deleteWorkstation(evaluationId: string, workstationId: string): Promise<void> {
    const wsRef = doc(
      this.firestore,
      `tmert_evaluations/${evaluationId}/workstations`,
      workstationId
    );
    await deleteDoc(wsRef);
  }
}
