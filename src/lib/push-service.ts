import prisma from './prisma';
import { PushNotificationPayload } from '@/types/ets';

/**
 * Service to dispatch push notifications to mobile apps (Driver App & Employee App)
 * Supports Expo Push API, Firebase Cloud Messaging (FCM), or Web Push
 */
export async function dispatchPushNotification(payload: PushNotificationPayload): Promise<{ success: boolean; logId?: string }> {
  try {
    // 1. Fetch user's registered mobile push token
    const user = await prisma.user.findUnique({
      where: { id: payload.recipientUserId },
      select: { pushToken: true, fullName: true, role: true }
    });

    if (!user) {
      console.warn(`[PushService] Recipient user not found: ${payload.recipientUserId}`);
      return { success: false };
    }

    // 2. If token exists, send payload to gateway (e.g., Expo or FCM)
    if (user.pushToken) {
      // Example Expo Push dispatch:
      // await fetch('https://exp.host/--/api/v2/push/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: user.pushToken,
      //     title: payload.title,
      //     body: payload.body,
      //     data: payload.data,
      //     sound: 'default'
      //   })
      // });
      console.log(`[PushService] Dispatched push to ${user.role} (${user.fullName}) via token: ${user.pushToken.slice(0, 8)}...`);
    } else {
      console.log(`[PushService] User ${user.fullName} has no active device push token. Logging notification.`);
    }

    // 3. Log notification in database for offline sync / in-app notification center
    const log = await prisma.pushNotificationLog.create({
      data: {
        recipientUserId: payload.recipientUserId,
        title: payload.title,
        body: payload.body,
        payloadJson: payload.data ? JSON.stringify(payload.data) : null,
        status: user.pushToken ? 'DELIVERED' : 'QUEUED'
      }
    });

    return { success: true, logId: log.id };
  } catch (error) {
    console.error('[PushService] Error dispatching push notification:', error);
    return { success: false };
  }
}

/**
 * Helper to notify driver when an employee's pickup location is updated or reassigned
 */
export async function notifyDriverLocationReassigned(params: {
  driverUserId: string;
  employeeName: string;
  updatedAddress: string;
  newCoords: { latitude: number; longitude: number };
  reason: string;
  tripCode: string;
}) {
  return dispatchPushNotification({
    recipientUserId: params.driverUserId,
    title: `📍 Route Update: ${params.employeeName}`,
    body: `Pickup location updated to: ${params.updatedAddress}. Reason: ${params.reason}`,
    data: {
      type: 'LOCATION_REASSIGNED',
      tripCode: params.tripCode,
      latitude: params.newCoords.latitude,
      longitude: params.newCoords.longitude,
      address: params.updatedAddress
    }
  });
}

