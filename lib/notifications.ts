import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { api } from './api'
import { endpoints } from '@/constants/api'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export interface NotificationData {
  type?: 'announcement' | 'module' | 'general'
  id?: string | number
  title?: string
  body?: string
  [key: string]: unknown
}

/**
 * Request permission for push notifications
 * @returns The push token if granted, null otherwise
 */
export async function requestNotificationPermission(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device')
    return null
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted')
    return null
  }

  // Get the push token
  try {
    const token = await getPushToken()
    return token
  } catch (error) {
    console.error('Error getting push token:', error)
    return null
  }
}

/**
 * Get the Expo push token for this device
 */
export async function getPushToken(): Promise<string | null> {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    return tokenData.data
  } catch (error) {
    console.error('Error getting Expo push token:', error)
    return null
  }
}

/**
 * Register the push token with the backend server
 * @param token The push token to register
 * @param userId The user ID (admin or student)
 * @param userType The type of user
 */
export async function registerPushToken(
  token: string,
  userId: string,
  userType: 'admin' | 'student'
): Promise<boolean> {
  try {
    const response = await api.post(endpoints.devices.register, {
      push_token: token,
      user_id: userId,
      user_type: userType,
      platform: Platform.OS as 'ios' | 'android',
    })

    return response.success
  } catch (error) {
    console.error('Error registering push token:', error)
    return false
  }
}

/**
 * Unregister the push token from the backend server
 * @param token The push token to unregister
 */
export async function unregisterPushToken(token: string): Promise<boolean> {
  try {
    const response = await api.delete(endpoints.devices.unregister(token))
    return response.success
  } catch (error) {
    console.error('Error unregistering push token:', error)
    return false
  }
}

/**
 * Set up Android notification channel (required for Android 8+)
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E1B4B', // Primary color
    })

    // Channel for announcements
    await Notifications.setNotificationChannelAsync('announcements', {
      name: 'Pengumuman',
      description: 'Notifikasi pengumuman baru dari Lab Kimia Dasar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B', // Accent color
    })
  }
}

/**
 * Schedule a local notification
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to attach
 * @param triggerSeconds Delay in seconds (optional)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  triggerSeconds?: number
): Promise<string> {
  const trigger: Notifications.NotificationTriggerInput = triggerSeconds
    ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: triggerSeconds }
    : null

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
    },
    trigger,
  })

  return notificationId
}

/**
 * Cancel a scheduled notification
 * @param notificationId The ID of the notification to cancel
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId)
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/**
 * Get the current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync()
}

/**
 * Set the badge count
 * @param count The badge count to set
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count)
}

/**
 * Clear the badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0)
}

/**
 * Add a listener for received notifications (when app is in foreground)
 * @param callback Function to call when notification is received
 * @returns Subscription object to remove the listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback)
}

/**
 * Add a listener for notification responses (when user taps notification)
 * @param callback Function to call when notification is tapped
 * @returns Subscription object to remove the listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

/**
 * Get the last notification response (if app was opened from notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync()
}

export default {
  requestNotificationPermission,
  getPushToken,
  registerPushToken,
  unregisterPushToken,
  setupNotificationChannel,
  scheduleLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  clearBadge,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
}
