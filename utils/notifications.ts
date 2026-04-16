import * as Notifications from 'expo-notifications';

// Function for creating notifications
export async function scheduleWeeklyReminder() {

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Weekly Target Reminder",
            body: "Don't forget to check your weeky application target!",
        },

        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: 2, hour: 9, minute: 0,
        },
    });
}

export async function cancelReminder() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}