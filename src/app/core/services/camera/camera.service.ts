import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  async takePhoto(): Promise<Photo | null> {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl, // DataUrl for easy immediate render and Firebase Storage upload
        source: CameraSource.Camera, // Always prompt for Camera by default
        quality: 80,
        height: 800, // Reasonable size for evidence
      });

      return capturedPhoto;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  async selectFromGallery(): Promise<Photo | null> {
    try {
      const selectedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 80,
        height: 800,
      });

      return selectedPhoto;
    } catch (error) {
      console.error('Error selecting photo:', error);
      return null;
    }
  }
}
