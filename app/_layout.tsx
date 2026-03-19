// this tsx file is similar to a base.html or a form of navigation wrapper

import { applicationsTable } from "@/db/schema";
import { seedApplicationsIfEmpty } from "@/db/seed ";
import { Stack } from "expo-router"; // Stack is a React component responsible for a form of navigation
import { createContext, useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context"; // Since IOS is the emulator in use, having a global safe area view is needed
import { db } from "../db/client";

export type Application = {
    id: number; 
    jobTitle: string;
    jobCompany: string;
    applyDate: string;
};

type ApplicationContextType = {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
};

export const ApplicationContext = createContext<ApplicationContextType | null>(null);


export default function base () {

  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const load = async() => {
      await seedApplicationsIfEmpty();
      
      const rows = await db.select().from(applicationsTable);
      setApplications(rows);
    };
    
    load();
  }, []);


  return (
    <ApplicationContext.Provider value={{ applications, setApplications }}> 
      <SafeAreaProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>

            <Stack.Screen name="(tabs)"/>
            {/* The line above will help create a persistent bottom nav bar*/}
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </ApplicationContext.Provider>
  ); // ScreenOptions is a prop inside Stack, Screen is a subcomponent attached to Stack
}