import { useContext } from "react";
import { ScrollView } from "react-native";
import { Divider, List, Switch, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../_layout";

export default function SettingsScreen() { 
    const {isDarkMode, toggleTheme} = useContext(ThemeContext);
    const theme = useTheme();

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
                    onPress={() => {}} 
                />

                <List.Item title="Delete Account" left={() => <List.Icon icon="delete-outline" />} 
                    onPress={() => {}} 
                />


            </ScrollView>
        </SafeAreaView>
    );
}
