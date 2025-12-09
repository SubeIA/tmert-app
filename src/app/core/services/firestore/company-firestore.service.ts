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
  arrayUnion,
  arrayRemove,
} from '@angular/fire/firestore';
import { Company, CreateCompanyDto } from '@models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyFirestoreService {
  private firestore = inject(Firestore);
  private readonly COMPANIES_COLLECTION = 'companies';

  async createCompany(companyData: CreateCompanyDto): Promise<string> {
    const companyRef = doc(collection(this.firestore, this.COMPANIES_COLLECTION));

    const data: Record<string, unknown> = {
      id: companyRef.id,
      ...companyData,
      evaluatorIds: [],
      evaluations: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(companyRef, data);
    return companyRef.id;
  }

  async getCompany(companyId: string): Promise<Company | null> {
    try {
      const companyRef = doc(this.firestore, this.COMPANIES_COLLECTION, companyId);
      const companySnap = await getDoc(companyRef);

      if (!companySnap.exists()) {
        return null;
      }

      const data = companySnap.data();
      return {
        id: companySnap.id,
        name: data['name'],
        rut: data['rut'],
        address: data['address'],
        industry: data['industry'],
        contactName: data['contactName'],
        contactEmail: data['contactEmail'],
        contactPhone: data['contactPhone'],
        evaluatorIds: data['evaluatorIds'] || [],
        evaluations: data['evaluations'] || [],
        createdAt: data['createdAt']?.toDate(),
        updatedAt: data['updatedAt']?.toDate(),
      } as Company;
    } catch (error) {
      console.error('Error getting company:', error);
      return null;
    }
  }

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<void> {
    const companyRef = doc(this.firestore, this.COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async getCompaniesByEvaluator(evaluatorId: string): Promise<Company[]> {
    try {
      const companiesRef = collection(this.firestore, this.COMPANIES_COLLECTION);
      const q = query(companiesRef, where('evaluatorIds', 'array-contains', evaluatorId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data['name'],
          rut: data['rut'],
          address: data['address'],
          industry: data['industry'],
          contactName: data['contactName'],
          contactEmail: data['contactEmail'],
          contactPhone: data['contactPhone'],
          evaluatorIds: data['evaluatorIds'] || [],
          evaluations: data['evaluations'] || [],
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate(),
        } as Company;
      });
    } catch (error) {
      console.error('Error getting companies by evaluator:', error);
      return [];
    }
  }

  async addEvaluatorToCompany(companyId: string, evaluatorId: string): Promise<void> {
    const companyRef = doc(this.firestore, this.COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      evaluatorIds: arrayUnion(evaluatorId),
      updatedAt: serverTimestamp(),
    });
  }

  async removeEvaluatorFromCompany(companyId: string, evaluatorId: string): Promise<void> {
    const companyRef = doc(this.firestore, this.COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      evaluatorIds: arrayRemove(evaluatorId),
      updatedAt: serverTimestamp(),
    });
  }

  async addEvaluationToCompany(companyId: string, evaluationId: string): Promise<void> {
    const companyRef = doc(this.firestore, this.COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      evaluations: arrayUnion(evaluationId),
      updatedAt: serverTimestamp(),
    });
  }

  async removeEvaluationFromCompany(companyId: string, evaluationId: string): Promise<void> {
    const companyRef = doc(this.firestore, this.COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      evaluations: arrayRemove(evaluationId),
      updatedAt: serverTimestamp(),
    });
  }
}
