/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Real-Time Network State Monitor & Outbox Synchronization Service
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { offlineStorage } from './offlineStorage';
import { QueuedAction } from '../types';

type NetworkCallback = (isConnected: boolean) => void;
type SyncCallback = (pendingCount: number) => void;

class SyncService {
  private isConnected: boolean = true;
  private networkListeners: NetworkCallback[] = [];
  private syncListeners: SyncCallback[] = [];
  private isSyncing: boolean = false;

  private unsubscribeNetInfo: (() => void) | null = null;

  constructor() {
    this.initNetworkListener();
  }

  public startListening() {
    if (!this.unsubscribeNetInfo) {
      this.initNetworkListener();
    }
  }

  public stopListening() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
  }

  private initNetworkListener() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
      const wasDisconnected = !this.isConnected;
      this.isConnected = connected;

      this.networkListeners.forEach((callback) => callback(connected));

      // Trigger automatic flush when returning to online mode
      if (connected && wasDisconnected) {
        this.flushOutbox();
      }
    });
  }

  public subscribeToNetwork(callback: NetworkCallback): () => void {
    this.networkListeners.push(callback);
    callback(this.isConnected);
    return () => {
      this.networkListeners = this.networkListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeToSync(callback: SyncCallback): () => void {
    this.syncListeners.push(callback);
    this.notifyPendingCount();
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  public async getPendingCount(): Promise<number> {
    const queue = await offlineStorage.getQueuedActions();
    return queue.length;
  }

  public async notifyPendingCount(): Promise<void> {
    const count = await this.getPendingCount();
    this.syncListeners.forEach((cb) => cb(count));
  }

  public getIsOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Flushes queued actions to the server when connection is present
   */
  public async flushOutbox(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.isSyncing) return { success: false, syncedCount: 0 };
    if (!this.isConnected) return { success: false, syncedCount: 0 };

    this.isSyncing = true;
    try {
      const queue: QueuedAction[] = await offlineStorage.getQueuedActions();
      if (queue.length === 0) {
        this.isSyncing = false;
        return { success: true, syncedCount: 0 };
      }

      // Simulate sending batch actions to central ETS dispatch server
      // In production, this POSTs to /api/dispatch/driver-actions-batch
      await new Promise((resolve) => setTimeout(resolve, 800));

      const count = queue.length;
      await offlineStorage.clearQueuedActions();
      await this.notifyPendingCount();

      this.isSyncing = false;
      return { success: true, syncedCount: count };
    } catch (err) {
      console.warn('Outbox synchronization failed:', err);
      this.isSyncing = false;
      return { success: false, syncedCount: 0 };
    }
  }
}

export const syncService = new SyncService();
