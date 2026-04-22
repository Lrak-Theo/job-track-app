import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "../_layout";

export default function nav_bar() {

    const { isDarkMode } = useContext(ThemeContext);

    const tabBarStyle = {
        backgroundColor: isDarkMode ? '#1A1518' : '#FFFFFF',
        borderTopColor: isDarkMode ? '#2C2329' : '#E8E0DC',
    };

    const activeTintColor = isDarkMode ? '#E4BB97' : '#9D5C63';
    const inactiveTintColor = isDarkMode ? '#6B5F78' : '#9A8A94';

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle,
            tabBarActiveTintColor: activeTintColor,
            tabBarInactiveTintColor: inactiveTintColor,
        }}>
            <Tabs.Screen name="dashboard" options={{ title: "Dashboard",
                tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="monitor-dashboard" color={color} size={size} />),
            }} />

            <Tabs.Screen name="application_list" options={{ title: "Applications",
                tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="briefcase-outline" color={color} size={size} />),
            }} />

            <Tabs.Screen name="settings" options={{ title: "Settings",
                tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="cog-outline" color={color} size={size} />),
            }} />

        </Tabs>
    );
}
