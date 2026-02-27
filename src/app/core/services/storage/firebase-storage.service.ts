import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  private storage = inject(Storage);

  /**
   * Uploads a file to Firebase Storage
   * @param path The path where the file will be uploaded (e.g. evaluations/123/evidence/photo.jpg)
   * @param file The file to upload
   * @returns An observable that emits the upload progress and finally the download URL
   */
  uploadFile(
    path: string,
    file: File
  ): Observable<{ progress: number; downloadUrl?: string; error?: Error }> {
    return new Observable(observer => {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next({ progress });
        },
        error => {
          observer.error({ progress: 0, error });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            observer.next({ progress: 100, downloadUrl });
            observer.complete();
          } catch (error) {
            observer.error({ progress: 100, error });
          }
        }
      );
    });
  }

  /**
   * Deletes a file from Firebase Storage
   * @param path The path of the file to delete
   */
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }
}
