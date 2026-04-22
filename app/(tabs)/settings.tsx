import { cancelReminder, scheduleWeeklyReminder } from '@/utils/notifications';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { Alert, Image, ScrollView, View } from "react-native";
import { Divider, List, Switch, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from '../../db/client';
import { applicationsTable, applicationStatusLogsTable, categoriesTable, targetsTable, usersTable } from '../../db/schema';
import { AuthContext, ThemeContext } from "../_layout";


export default function SettingsScreen() { 

    // Load the context and theme
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const {isDarkMode, toggleTheme} = useContext(ThemeContext);
    const theme = useTheme();

    // set the state values 
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);


    // Handlers logic
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
                    text: 'Delete',
                    style: 'destructive', onPress: async () => {
                        const userId = authContext?.currentUser?.id;

                        if (!userId) return;

                        await db.delete(targetsTable).where(eq(targetsTable.userId, userId));
                        await db.delete(applicationStatusLogsTable);
                        await db.delete(applicationsTable).where(eq(applicationsTable.userId, userId));
                        await db.delete(categoriesTable).where(eq(categoriesTable.userId, userId));
                        await db.delete(usersTable).where(eq(usersTable.id, userId));

                        await authContext?.logout();
                    }
                }
            ]
        )
    }

    const handleNotificationToggle = async (value: boolean) => { 
        setNotificationsEnabled(value);
        await AsyncStorage.setItem('notificationsEnabled', String(value));
        if (value) {
            await scheduleWeeklyReminder();
        } else {
            await cancelReminder();
        }
    }; 
    

    // Effects...
    useEffect(() => {
        AsyncStorage.getItem('notificationsEnabled').then((val) => {
            if (val !== null) setNotificationsEnabled(val === 'true');
        });
    }, []);



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: theme.colors.background }}>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Image source={require('@/assets/images/Sauron-Brand-Icon.png')} style={{ width: 72, height: 72 }} resizeMode="contain" />
                    <Text variant="headlineMedium" style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}>Sauron</Text>
                </View>

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

                {/* Application Details  */}
                <Text variant="labelLarge" style={{ marginBottom: 8 }}>
                    Application Details
                </Text>

                <List.Item title="Manage Categories" left={() => <List.Icon icon="tag-outline" />}
                    onPress={() => router.push('/category_manage' as any)}
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

                <Divider style={{ marginVertical: 16 }} />

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
