import { Injectable } from '@angular/core';

export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  getItem<T>(key: string, storageType: StorageType = StorageType.SESSION): T | null {
    try {
      const storage = this.getStorage(storageType);
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item "${key}" from ${storageType}:`, error);
      return null;
    }
  }

  setItem<T>(key: string, value: T, storageType: StorageType = StorageType.SESSION): void {
    try {
      const storage = this.getStorage(storageType);
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item "${key}" in ${storageType}:`, error);
    }
  }

  removeItem(key: string, storageType: StorageType = StorageType.SESSION): void {
    try {
      const storage = this.getStorage(storageType);
      storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item "${key}" from ${storageType}:`, error);
    }
  }

  removeFromBoth(key: string): void {
    this.removeItem(key, StorageType.LOCAL);
    this.removeItem(key, StorageType.SESSION);
  }

  hasItem(key: string, storageType: StorageType = StorageType.SESSION): boolean {
    try {
      const storage = this.getStorage(storageType);
      return storage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  clear(storageType: StorageType = StorageType.SESSION): void {
    try {
      const storage = this.getStorage(storageType);
      storage.clear();
    } catch (error) {
      console.error(`Error clearing ${storageType}:`, error);
    }
  }

  clearAll(): void {
    this.clear(StorageType.LOCAL);
    this.clear(StorageType.SESSION);
  }

  getAllKeys(storageType: StorageType = StorageType.SESSION): string[] {
    try {
      const storage = this.getStorage(storageType);
      return Object.keys(storage);
    } catch {
      return [];
    }
  }

  moveItem(key: string, from: StorageType, to: StorageType): void {
    const value = this.getItem(key, from);
    if (value !== null) {
      this.setItem(key, value, to);
      this.removeItem(key, from);
    }
  }

  private getStorage(storageType: StorageType): Storage {
    return storageType === StorageType.LOCAL ? localStorage : sessionStorage;
  }
}
