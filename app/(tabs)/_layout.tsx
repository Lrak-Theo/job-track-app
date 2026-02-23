import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function nav_bar() {
    
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="dashboard" options={{title:"Dashboard", 
                tabBarIcon: ({color, size}) => (<MaterialCommunityIcons name="monitor-dashboard" color={color} size={size} />
            ),
        }}
        />

            <Tabs.Screen name="application_list" options={{title:"Applications", 
                tabBarIcon: ({color, size}) => (<MaterialCommunityIcons name="briefcase-outline" color={color} size={size} />
            ),
        }}
        />
        
        </Tabs>
    );
}