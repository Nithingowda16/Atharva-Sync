/**
 * Atharva Travels ETS — Employee Android App
 * Notification, Support, Feedback & Emergency Services (Phase 1 Frontend Placeholders)
 */

import { NotificationRecord, SupportTicket, FeedbackSubmission, UserAddress } from '../types';

export const notificationService = {
  async getNotifications(): Promise<NotificationRecord[]> {
    return [];
  },

  async markAsRead(id: string): Promise<void> {},
  async clearAll(): Promise<void> {},
};

export const supportService = {
  async getSupportTickets(): Promise<SupportTicket[]> {
    return [];
  },

  async createSupportTicket(subject: string, category: string, description: string): Promise<{ success: boolean }> {
    return { success: true };
  },
};

export const feedbackService = {
  async submitFeedback(payload: FeedbackSubmission): Promise<{ success: boolean }> {
    return { success: true };
  },
};

export const emergencyService = {
  async triggerSos(tripId?: string, latitude?: number, longitude?: number): Promise<{ success: boolean; alertCode?: string }> {
    // In Phase 1 Frontend: Validates UI flow, does not actually dispatch backend SOS
    return {
      success: true,
      alertCode: `SOS-${Date.now().toString().slice(-4)}`,
    };
  },
};

export const employeeService = {
  async getAddresses(): Promise<UserAddress[]> {
    return [];
  },

  async addAddress(address: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    return {
      id: `addr-${Date.now()}`,
      ...address,
    };
  },

  async deleteAddress(id: string): Promise<boolean> {
    return true;
  },
};

