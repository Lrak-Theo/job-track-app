// this tsx file is similar to a base.html or a form of navigation wrapper

import { Stack } from "expo-router"; // Stack is a React component responsible for a form of navigation
import { PaperProvider } from "react-native-paper";

export default function base () {
    return (
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>

          <Stack.Screen name="(tabs)"/>
          {/* The line above will help create a persistent bottom nav bar*/}
        </Stack>
      </PaperProvider>
    ); // ScreenOptions is a prop inside Stack, Screen is a subcomponent attached to Stack
}