import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { TmertEvaluation } from '@models/evaluation.model';
import { TmertService } from '../tmert/tmert.service';

@Injectable({
  providedIn: 'root',
})
export class EvaluationFirestoreService {
  private firestore = inject(Firestore);
  private tmertService = inject(TmertService);
  private readonly EVALUATIONS_COLLECTION = 'tmert_evaluations';

  async createEvaluation(
    companyId: string,
    centerId: string,
    companyName: string,
    evaluatorId: string,
    evaluatorName: string,
    initialData?: Record<string, unknown>
  ): Promise<string> {
    const evalRef = doc(collection(this.firestore, this.EVALUATIONS_COLLECTION));

    // Crear thread para el asistente TMERT
    let threadId: string | undefined;
    try {
      const threadResponse = await firstValueFrom(
        this.tmertService.createThread({
          evaluation_id: evalRef.id,
          company_id: companyId,
          company_name: companyName,
          evaluator_id: evaluatorId,
        })
      );
      threadId = threadResponse.id;
      console.log('Thread creado para evaluación:', threadId);
    } catch (error) {
      console.warn('No se pudo crear el thread del asistente:', error);
      // Continuar sin thread, se puede crear después
    }

    const evaluationData: Record<string, unknown> = {
      id: evalRef.id,
      companyId,
      centerId,
      companyName,
      evaluatorId,
      evaluatorName,
      status: 'draft',
      progress: 0,
      threadId,
      startDate: serverTimestamp(),
      data: initialData || {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(evalRef, evaluationData);
    return evalRef.id;
  }

  async getEvaluation(evaluationId: string): Promise<TmertEvaluation | null> {
    try {
      const evalRef = doc(this.firestore, this.EVALUATIONS_COLLECTION, evaluationId);
      const evalSnap = await getDoc(evalRef);

      if (!evalSnap.exists()) {
        return null;
      }

      const data = evalSnap.data();
      return {
        id: evalSnap.id,
        companyId: data['companyId'],
        centerId: data['centerId'],
        companyName: data['companyName'],
        evaluatorId: data['evaluatorId'],
        evaluatorName: data['evaluatorName'],
        status: data['status'],
        progress: data['progress'],
        currentStep: data['currentStep'],
        stepsData: data['stepsData'],
        threadId: data['threadId'],
        startDate: data['startDate']?.toDate(),
        completedDate: data['completedDate']?.toDate(),
        data: data['data'] || {},
        createdAt: data['createdAt']?.toDate(),
        updatedAt: data['updatedAt']?.toDate(),
      } as TmertEvaluation;
    } catch (error) {
      console.error('Error getting evaluation:', error);
      return null;
    }
  }

  async updateEvaluation(evaluationId: string, updates: Partial<TmertEvaluation>): Promise<void> {
    const evalRef = doc(this.firestore, this.EVALUATIONS_COLLECTION, evaluationId);
    await updateDoc(evalRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async getEvaluationsByEvaluator(evaluatorId: string): Promise<TmertEvaluation[]> {
    try {
      const evalsRef = collection(this.firestore, this.EVALUATIONS_COLLECTION);
      const q = query(evalsRef, where('evaluatorId', '==', evaluatorId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          companyId: data['companyId'],
          centerId: data['centerId'],
          companyName: data['companyName'],
          evaluatorId: data['evaluatorId'],
          evaluatorName: data['evaluatorName'],
          status: data['status'],
          progress: data['progress'],
          startDate: data['startDate']?.toDate(),
          completedDate: data['completedDate']?.toDate(),
          data: data['data'] || {},
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate(),
        } as TmertEvaluation;
      });
    } catch (error) {
      console.error('Error getting evaluations by evaluator:', error);
      return [];
    }
  }

  async getEvaluationsByCompany(companyId: string): Promise<TmertEvaluation[]> {
    try {
      const evalsRef = collection(this.firestore, this.EVALUATIONS_COLLECTION);
      const q = query(evalsRef, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          companyId: data['companyId'],
          companyName: data['companyName'],
          evaluatorId: data['evaluatorId'],
          evaluatorName: data['evaluatorName'],
          status: data['status'],
          progress: data['progress'],
          startDate: data['startDate']?.toDate(),
          completedDate: data['completedDate']?.toDate(),
          data: data['data'] || {},
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate(),
        } as TmertEvaluation;
      });
    } catch (error) {
      console.error('Error getting evaluations by company:', error);
      return [];
    }
  }

  async getEvaluationsByStatus(
    status: 'draft' | 'in-progress' | 'completed' | 'archived'
  ): Promise<TmertEvaluation[]> {
    try {
      const evalsRef = collection(this.firestore, this.EVALUATIONS_COLLECTION);
      const q = query(evalsRef, where('status', '==', status));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          companyId: data['companyId'],
          companyName: data['companyName'],
          evaluatorId: data['evaluatorId'],
          evaluatorName: data['evaluatorName'],
          status: data['status'],
          progress: data['progress'],
          startDate: data['startDate']?.toDate(),
          completedDate: data['completedDate']?.toDate(),
          data: data['data'] || {},
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate(),
        } as TmertEvaluation;
      });
    } catch (error) {
      console.error('Error getting evaluations by status:', error);
      return [];
    }
  }
}
