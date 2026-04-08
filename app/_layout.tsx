// this tsx file is similar to a base.html or a form of navigation wrapper

import { applicationsTable, applicationStatusLogsTable, categoriesTable, targetsTable } from "@/db/schema";
import { seedApplicationsIfEmpty } from "@/db/seed";
import { Stack } from "expo-router"; // Stack is a React component responsible for a form of navigation
import { createContext, useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context"; // Since IOS is the emulator in use, having a global safe area view is needed
import { db } from "../db/client";

export type Category = {
  id: number;
  name: string;
  color: string;
};

export type Application = {
    id: number; 
    jobTitle: string;
    jobCompany: string;
    categoryId: number;
    applyDate: string;
    status: string;
};

export type StatusLog = {
    id: number;
    applicationId: number;
    status: string;
    changedAt: string;
}


type ApplicationContextType = {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;

  statusLogs: StatusLog[];
  setStatusLogs: React.Dispatch<React.SetStateAction<StatusLog[]>>;
};

export const ApplicationContext = createContext<ApplicationContextType | null>(null);


export default function Base () {

  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);

  useEffect(() => {
    const load = async() => {
      await seedApplicationsIfEmpty();
      
      const categoryRows = await db.select().from(categoriesTable);
      const applicationRows = await db.select().from(applicationsTable);
      const applicationstatuslogsRows = await db.select().from(applicationStatusLogsTable);
      const targetsTableRows = await db.select().from(targetsTable);

      console.log('Categories: ', JSON.stringify(categoryRows, null, 2));
      console.log('Applications: ', JSON.stringify(applicationRows, null, 2));
      console.log('Application Status Logs', JSON.stringify(applicationstatuslogsRows, null, 2));
      console.log('Targets', JSON.stringify(targetsTableRows, null, 2));
      
      setCategories(categoryRows);
      setApplications(applicationRows);
      setStatusLogs(applicationstatuslogsRows);
    };
    
    load();
  }, []);


  return (
    <ApplicationContext.Provider value={{ applications, setApplications, categories, setCategories, statusLogs, setStatusLogs }}> 
      <SafeAreaProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false  }}>

            <Stack.Screen name="(tabs)"/>
            {/* The line above will help create a persistent bottom nav bar*/}

          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </ApplicationContext.Provider>
  ); // ScreenOptions is a prop inside Stack, Screen is a subcomponent attached to Stack
}