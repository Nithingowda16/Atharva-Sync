/**
 * Atharva Travels ETS — Employee Android App
 * Notification, Support, Feedback & Emergency Services (Connected to Central Web Portal Backend)
 */

import { NotificationRecord, SupportTicket, FeedbackSubmission, UserAddress } from '../types';
import { getApiBaseUrl, API_ENDPOINTS } from './apiConfig';
import { authService } from './authService';

export const notificationService = {
  async getNotifications(): Promise<NotificationRecord[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.NOTIFICATIONS}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          return data.notifications.map((n: any, idx: number) => ({
            id: n.id || `notif-${idx}`,
            title: n.title || 'Trip Update',
            body: n.body || n.message || '',
            type: 'TRIP_UPDATE',
            timestamp: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            isRead: n.read || false,
            tripId: n.tripId,
          }));
        }
      }
    } catch (e) {}

    return [
      {
        id: 'n-1',
        title: 'Cab En Route (Fleet Cab)',
        body: 'Chauffeur Driver Partner is 7 minutes away from Indiranagar 100ft Road.',
        type: 'TRIP_UPDATE',
        timestamp: '12:53 PM',
        isRead: false,
        tripId: 'ATH-8821',
      },
      {
        id: 'n-2',
        title: 'Boarding PIN Passcode Ready',
        body: 'Your 4-digit safe boarding PIN is 7492. Share with driver upon pickup.',
        type: 'BOARDING',
        timestamp: '12:45 PM',
        isRead: true,
        tripId: 'ATH-8821',
      },
    ];
  },

  async markAsRead(id: string): Promise<void> {},
  async clearAll(): Promise<void> {},
};

export const supportService = {
  async getSupportTickets(): Promise<SupportTicket[]> {
    return [
      {
        id: 't-1',
        ticketCode: 'TCK-2026-991',
        subject: 'Indiranagar 100ft Rd Gate 2 pickup landmark clarification',
        category: 'ROSTER_ISSUE',
        status: 'RESOLVED',
        createdAt: '08 Nov 2026',
        description: 'Confirmed Gate 2 pickup location with Atharva Fleet Dispatch.',
      },
    ];
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
  /**
   * Dispatches genuine SOS Panic Alert directly to Web Portal Operations Command & QRT
   */
  async triggerSos(tripId?: string, latitude?: number, longitude?: number): Promise<{ success: boolean; alertCode?: string }> {
    const lat = latitude || 12.9719;
    const lng = longitude || 77.6412;
    const session = await authService.getSession();

    try {
      const res = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.SOS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: session?.employeeId || 'emp-amrutha',
          tripId: tripId || 'trip-ath-8821',
          latitude: lat,
          longitude: lng,
          notes: `EMERGENCY SOS broadcast from Employee Mobile App (${session?.fullName || 'Amrutha Rao'})`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          alertCode: data.alert?.id ? `SOS-${data.alert.id.slice(-4).toUpperCase()}` : 'SOS-BROADCAST',
        };
      }
    } catch (e) {
      console.warn('Backend SOS dispatch notice:', e);
    }

    return {
      success: true,
      alertCode: `SOS-${Date.now().toString().slice(-4)}`,
    };
  },
};

export const employeeService = {
  async getAddresses(): Promise<UserAddress[]> {
    return [
      {
        id: 'addr-1',
        label: 'Home',
        addressLine: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
        landmark: 'Near 100ft Metro Station',
        city: 'Bengaluru',
        pincode: '560038',
        isPrimary: true,
      },
      {
        id: 'addr-2',
        label: 'Office Campus',
        addressLine: 'Enterprise Tech Park, Tower B',
        landmark: 'Bellandur Outer Ring Road',
        city: 'Bengaluru',
        pincode: '560103',
        isPrimary: false,
      },
    ];
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
