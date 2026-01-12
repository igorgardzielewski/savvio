import { Subscription } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_STORAGE_KEY = 'subscription_notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('subscriptions', {
            name: 'Subscription Reminders',
            importance: Notifications.AndroidImportance.HIGH,
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

interface StoredNotifications {
    [subscriptionId: string]: string[];
}

async function getStoredNotifications(): Promise<StoredNotifications> {
    try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

async function saveNotificationIds(subscriptionId: number, notificationIds: string[]): Promise<void> {
    const stored = await getStoredNotifications();
    stored[subscriptionId.toString()] = notificationIds;
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(stored));
}

async function removeNotificationIds(subscriptionId: number): Promise<void> {
    const stored = await getStoredNotifications();
    delete stored[subscriptionId.toString()];
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(stored));
}

export async function scheduleSubscriptionNotifications(subscription: Subscription): Promise<void> {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;
    await cancelSubscriptionNotifications(subscription.id);
    const paymentDate = new Date(subscription.paymentDate);
    paymentDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const notificationIds: string[] = [];

    const notifications = [
        { days: 3, title: 'Payment Reminder', body: `${subscription.shop.name} payment is due in 3 days` },
        { days: 1, title: 'Payment Tomorrow', body: `${subscription.shop.name} payment is due tomorrow` },
        { hours: 1, title: 'Payment Soon', body: `${subscription.shop.name} payment is due in 1 hour` },
    ];

    for (const notif of notifications) {
        const triggerDate = new Date(paymentDate);

        if (notif.days) {
            triggerDate.setDate(triggerDate.getDate() - notif.days);
            triggerDate.setHours(9, 0, 0, 0);
        } else if (notif.hours) {
            triggerDate.setDate(triggerDate.getDate() - 1);
            triggerDate.setHours(23, 0, 0, 0);
        }

        if (triggerDate > now) {
            try {
                const id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: notif.title,
                        body: notif.body,
                        data: { subscriptionId: subscription.id },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: triggerDate,
                    },
                });
                notificationIds.push(id);
            } catch (error) {
                console.error('Failed to schedule notification:', error);
            }
        }
    }
    if (notificationIds.length > 0) {
        await saveNotificationIds(subscription.id, notificationIds);
    }
}

export async function cancelSubscriptionNotifications(subscriptionId: number): Promise<void> {
    const stored = await getStoredNotifications();
    const notificationIds = stored[subscriptionId.toString()];

    if (notificationIds && notificationIds.length > 0) {
        for (const id of notificationIds) {
            try {
                await Notifications.cancelScheduledNotificationAsync(id);
            } catch (error) {
                console.error('Failed to cancel notification:', error);
            }
        }
        await removeNotificationIds(subscriptionId);
    }
}

export async function checkAndScheduleAllSubscriptionNotifications(subscriptions: Subscription[]): Promise<void> {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const stored = await getStoredNotifications();

    for (const subscription of subscriptions) {
        const shouldNotify = subscription.shouldNotify !== false;

        if (!shouldNotify) continue;

        const existingIds = stored[subscription.id.toString()];

        if (!existingIds || existingIds.length === 0) {
            await scheduleSubscriptionNotifications(subscription);
        }
    }
}
