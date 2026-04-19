import { cancelReminder, scheduleWeeklyReminder } from '@/utils/notifications';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Divider, List, Switch, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from '../../db/client';
import { applicationsTable, targetsTable, usersTable } from '../../db/schema';
import { AuthContext, ThemeContext } from "../_layout";


export default function SettingsScreen() { 

    const router = useRouter()
    const authContext = useContext(AuthContext);

    const {isDarkMode, toggleTheme} = useContext(ThemeContext);
    const theme = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Adding logout for user
    const handleLogout = async () => {
        await authContext?.logout();
    };

    // Adding delete account for user
    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all your applications.',
            [
                { text: 'Cancel', style: 'cancel'},
                {
                    text: 'Dete',
                    style: 'destructive', onPress: async () => {
                        const userId = authContext?.currentUser?.id;

                        if (!userId) return;

                        await db.delete(targetsTable).where(eq(targetsTable.userId, userId));
                        await db.delete(applicationsTable).where(eq(applicationsTable.userId, userId));
                        await db.delete(usersTable).where(eq(usersTable.id, userId));

                        await authContext?.logout();
                    }
                }
            ]
        )
    }


    useEffect(() => {
        AsyncStorage.getItem('notificationsEnabled').then((val) => {
            if (val !== null) setNotificationsEnabled(val === 'true');
        });
    }, []);

    const handleNotificationToggle = async (value: boolean) => { 
        setNotificationsEnabled(value);
        await AsyncStorage.setItem('notificationsEnabled', String(value));
        if (value) {
            await scheduleWeeklyReminder();
        } else {
            await cancelReminder();
        }
    }; 


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: theme.colors.background }}>

                <Text variant="headlineMedium" style={{ marginBottom: 24 }}>
                    Settings
                </Text>

                {/* Feature to switch from either light mode or dark mode */}
                <Text variant="labelLarge" style={{ marginBottom: 8 }}>
                    Theme
                </Text>

                <List.Item title="Dark Mode" description="Toggle Dark Mode On"
                    right={() => (
                        <Switch value={isDarkMode} onValueChange={toggleTheme}/>
                    )}
                />

                <Divider style={{ marginVertical: 16 }} />

                {/* Account settings */}
                <Text variant="labelLarge" style={{ marginBottom: 8 }}>
                    Account
                </Text>

                <List.Item title="Logout" left={() => <List.Icon icon="logout" />}
                    onPress={handleLogout} 
                />

                <List.Item title="Delete Account" left={() => <List.Icon icon="delete-outline" />} 
                    onPress={handleDeleteAccount} 
                />

                {/* Notifications */}
                <Text variant="labelLarge" style={{ marginBottom: 8 }}>
                    Notifications
                </Text>

                <List.Item title="Weekly Target Reminder" description="Reminds you every Monday at 09:00"
                    right={() => (
                        <Switch value={notificationsEnabled} onValueChange={handleNotificationToggle}/>
                    )}
                />

            </ScrollView>
        </SafeAreaView>
    );
}
