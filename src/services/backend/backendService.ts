/**
 * Backend Service
 *
 * Unified interface for backend operations supporting both Firebase and Supabase.
 * Handles authentication, data sync, and cloud storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, SRSItem, SimpleGameHistory, Weakness } from '../../types';

export type BackendProvider = 'firebase' | 'supabase' | 'none';

export interface BackendConfig {
  provider: BackendProvider;
  apiKey?: string;
  projectId?: string;
  authDomain?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface SyncStatus {
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
  error?: string;
}

export interface UserAuth {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous: boolean;
}

/**
 * Abstract backend service interface
 */
export abstract class BackendService {
  protected config: BackendConfig;
  protected isInitialized: boolean = false;

  constructor(config: BackendConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;

  // Authentication
  abstract signUp(email: string, password: string): Promise<UserAuth>;
  abstract signIn(email: string, password: string): Promise<UserAuth>;
  abstract signInAnonymously(): Promise<UserAuth>;
  abstract signOut(): Promise<void>;
  abstract getCurrentUser(): Promise<UserAuth | null>;

  // Data sync
  abstract syncUserProfile(profile: UserProfile): Promise<void>;
  abstract syncSRSItems(items: SRSItem[]): Promise<void>;
  abstract syncGameHistory(games: SimpleGameHistory[]): Promise<void>;
  abstract syncWeaknesses(weaknesses: Weakness[]): Promise<void>;

  // Data retrieval
  abstract fetchUserProfile(uid: string): Promise<UserProfile | null>;
  abstract fetchSRSItems(uid: string): Promise<SRSItem[]>;
  abstract fetchGameHistory(uid: string, limit?: number): Promise<SimpleGameHistory[]>;
  abstract fetchWeaknesses(uid: string): Promise<Weakness[]>;

  // Streak validation
  abstract validateStreak(uid: string, currentStreak: number): Promise<boolean>;
  abstract recordActivity(uid: string): Promise<void>;

  // Cloud storage
  abstract uploadAvatar(uid: string, imageUri: string): Promise<string>;
  abstract deleteAvatar(uid: string): Promise<void>;
}

/**
 * Local storage fallback when offline or no backend configured
 */
export class LocalBackendService extends BackendService {
  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async signUp(email: string, password: string): Promise<UserAuth> {
    throw new Error('Local backend does not support sign up');
  }

  async signIn(email: string, password: string): Promise<UserAuth> {
    throw new Error('Local backend does not support sign in');
  }

  async signInAnonymously(): Promise<UserAuth> {
    const uid = await this.getOrCreateLocalUID();
    return {
      uid,
      email: 'local@chess.app',
      isAnonymous: true,
    };
  }

  async signOut(): Promise<void> {
    // No-op for local storage
  }

  async getCurrentUser(): Promise<UserAuth | null> {
    const uid = await this.getOrCreateLocalUID();
    return {
      uid,
      email: 'local@chess.app',
      isAnonymous: true,
    };
  }

  async syncUserProfile(profile: UserProfile): Promise<void> {
    // Data is already in local SQLite, no sync needed
  }

  async syncSRSItems(items: SRSItem[]): Promise<void> {
    // Data is already in local SQLite, no sync needed
  }

  async syncGameHistory(games: SimpleGameHistory[]): Promise<void> {
    // Data is already in local SQLite, no sync needed
  }

  async syncWeaknesses(weaknesses: Weakness[]): Promise<void> {
    // Data is already in local SQLite, no sync needed
  }

  async fetchUserProfile(uid: string): Promise<UserProfile | null> {
    // Return null, data is in local SQLite
    return null;
  }

  async fetchSRSItems(uid: string): Promise<SRSItem[]> {
    return [];
  }

  async fetchGameHistory(uid: string, limit?: number): Promise<SimpleGameHistory[]> {
    return [];
  }

  async fetchWeaknesses(uid: string): Promise<Weakness[]> {
    return [];
  }

  async validateStreak(uid: string, currentStreak: number): Promise<boolean> {
    // Local validation only
    return true;
  }

  async recordActivity(uid: string): Promise<void> {
    // No-op for local storage
  }

  async uploadAvatar(uid: string, imageUri: string): Promise<string> {
    throw new Error('Local backend does not support avatar upload');
  }

  async deleteAvatar(uid: string): Promise<void> {
    // No-op
  }

  private async getOrCreateLocalUID(): Promise<string> {
    const stored = await AsyncStorage.getItem('@local_uid');
    if (stored) return stored;

    const uid = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('@local_uid', uid);
    return uid;
  }
}

/**
 * Sync queue for offline mode
 */
export class SyncQueue {
  private queue: SyncOperation[] = [];
  private isProcessing: boolean = false;

  async addOperation(operation: SyncOperation): Promise<void> {
    this.queue.push(operation);
    await this.persistQueue();
  }

  async processQueue(backend: BackendService): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const operation = this.queue[0];

        try {
          await this.executeOperation(operation, backend);
          this.queue.shift(); // Remove successful operation
          await this.persistQueue();
        } catch (error) {
          console.error('Sync operation failed:', error);
          // Keep operation in queue for retry
          break;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@sync_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('@sync_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }

  private async executeOperation(
    operation: SyncOperation,
    backend: BackendService
  ): Promise<void> {
    switch (operation.type) {
      case 'sync-profile':
        await backend.syncUserProfile(operation.data);
        break;
      case 'sync-srs':
        await backend.syncSRSItems(operation.data);
        break;
      case 'sync-games':
        await backend.syncGameHistory(operation.data);
        break;
      case 'sync-weaknesses':
        await backend.syncWeaknesses(operation.data);
        break;
      case 'record-activity':
        await backend.recordActivity(operation.data.uid);
        break;
    }
  }

  getPendingCount(): number {
    return this.queue.length;
  }
}

interface SyncOperation {
  type: 'sync-profile' | 'sync-srs' | 'sync-games' | 'sync-weaknesses' | 'record-activity';
  data: any;
  timestamp: number;
}

/**
 * Backend manager - handles provider selection and initialization
 */
export class BackendManager {
  private backend: BackendService;
  private syncQueue: SyncQueue;
  private syncStatus: SyncStatus = {
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false,
  };

  constructor(config: BackendConfig) {
    // For now, always use local backend
    // Firebase/Supabase implementations will be added later
    this.backend = new LocalBackendService(config);
    this.syncQueue = new SyncQueue();
  }

  async initialize(): Promise<void> {
    await this.backend.initialize();
    await this.syncQueue.loadQueue();
    this.syncStatus.pendingChanges = this.syncQueue.getPendingCount();
  }

  getBackend(): BackendService {
    return this.backend;
  }

  async sync(): Promise<void> {
    if (this.syncStatus.isSyncing) return;

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = undefined;

    try {
      await this.syncQueue.processQueue(this.backend);
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = this.syncQueue.getPendingCount();
    } catch (error: any) {
      this.syncStatus.error = error.message;
      console.error('Sync failed:', error);
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  async queueSync(operation: SyncOperation): Promise<void> {
    await this.syncQueue.addOperation(operation);
    this.syncStatus.pendingChanges = this.syncQueue.getPendingCount();

    // Try to sync immediately if online
    this.sync().catch(console.error);
  }
}

/**
 * Global backend manager instance
 */
let backendManager: BackendManager | null = null;

export function initializeBackend(config: BackendConfig): Promise<void> {
  backendManager = new BackendManager(config);
  return backendManager.initialize();
}

export function getBackendManager(): BackendManager {
  if (!backendManager) {
    throw new Error('Backend not initialized. Call initializeBackend() first.');
  }
  return backendManager;
}
