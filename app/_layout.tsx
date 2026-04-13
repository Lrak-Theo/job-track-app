// this tsx file is similar to a base.html or a form of navigation wrapper

import { applicationsTable, applicationStatusLogsTable, categoriesTable, targetsTable } from "@/db/schema";
import { seedApplicationsIfEmpty } from "@/db/seed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router"; // Stack is a React component responsible for a form of navigation
import { createContext, useEffect, useState } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
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

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ApplicationContext = createContext<ApplicationContextType | null>(null);

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

{/* Set base theme */}
const Theme_Key = 'app_theme'; 

const myLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#FEF5EF',
    surface: '#FFFFFF',
    primary: '#9D5C63',
    secondary: '#E4BB97',
    surfaceVariant: '#D6E3F8',
    onBackground: '#584B53',
    onSurface: '#584B53',
    onPrimary: '#FFFFFF',
  }
};

const myDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#2C2329',
    surface: '#3D3138',
    primary: '#9D5C63',
    secondary: '#E4BB97',
    surfaceVariant: '#4A3F55',
    onBackground: '#FEF5EF',
    onSurface: '#FEF5EF',
    onPrimary: '#FFFFFF',
  }
};

export default function Base () {

  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

      const savedTheme = await AsyncStorage.getItem(Theme_Key)
      if (savedTheme === 'dark') setIsDarkMode(true);
    };
    
    load();
  }, []);

  
  const toggleTheme = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    await AsyncStorage.setItem(Theme_Key, next ? 'dark' : 'light' );
  }

  {/* Potentially repallette own colour scheme */}
  const theme = isDarkMode ? myDarkTheme : myLightTheme;


  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ApplicationContext.Provider value={{ applications, setApplications, categories, setCategories, statusLogs, setStatusLogs }}> 
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false  }}>

              <Stack.Screen name="(tabs)"/>
              {/* The line above will help create a persistent bottom nav bar*/}

            </Stack>
          </PaperProvider>
        </SafeAreaProvider>
      </ApplicationContext.Provider>
    </ThemeContext.Provider>
  ); // ScreenOptions is a prop inside Stack, Screen is a subcomponent attached to Stack
}