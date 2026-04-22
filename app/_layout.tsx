// this tsx file is similar to a base.html or a form of navigation wrapper

import { applicationsTable, applicationStatusLogsTable, categoriesTable, targetsTable, usersTable } from "@/db/schema";
import { seedApplicationsIfEmpty } from "@/db/seed";
import { scheduleWeeklyReminder } from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eq } from 'drizzle-orm';
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router"; // Stack is a React component responsible for a form of navigation
import { createContext, useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context"; // Since IOS is the emulator in use, having a global safe area view is needed
import { db } from "../db/client";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type Category = {
  id: number;
  userId: number;
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
    notes: string | null;
};

export type StatusLog = {
    id: number;
    applicationId: number;
    status: string;
    changedAt: string;
}

// Adding Context Types
type AuthContextType = {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  loadUserData: (userId: number) => Promise<void>;
};

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

export const AuthContext = createContext<AuthContextType | null>(null);

export const ApplicationContext = createContext<ApplicationContextType | null>(null);

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

// Set base theme
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
    surface: '#5C5059',
    primary: '#C47B83',
    secondary: '#E4BB97',
    surfaceVariant: '#6B5F78',
    onBackground: '#F5EDE8',
    onSurface: '#F5EDE8',
    onPrimary: '#FFFFFF',
    outline: '#9A8A94',
    secondaryContainer: '#6B4A3A',
    onSecondaryContainer: '#F5EDE8',
  }
};

// Setting up the notification 
Notifications.setNotificationHandler({
  handleNotification: async() => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Base () {

  // Set state and theme 
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState <User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load data from the DB
  const loadUserData = async (userId: number) => {
    const applicationRows = await db.select().from(applicationsTable).where(eq(applicationsTable.userId, userId));
    const categoryRows = await db.select().from(categoriesTable).where(eq(categoriesTable.userId, userId));
    const applicationstatuslogRows = await db.select().from(applicationStatusLogsTable);

    setApplications(applicationRows);
    setCategories(categoryRows);
    setStatusLogs(applicationstatuslogRows);
  };

  // Effects...
  useEffect(() => {

    async function initNotifications() {
      const stored = await AsyncStorage.getItem('notificationsEnabled');
      const isEnabled = stored === null ? true : stored === 'true';
      if (!isEnabled) return;

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      await scheduleWeeklyReminder();
    }



    const load = async() => {
      await seedApplicationsIfEmpty();

      // Checking for saved session
      const savedUserId = await AsyncStorage.getItem('session_user_id');
      let activeUserId: number | null = null;

      if (savedUserId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.id, Number(savedUserId)));

        if (userRows.length > 0) {
          setCurrentUser(userRows[0]);
          activeUserId = userRows[0].id;
          router.replace('/' as any);
        } else {
          await AsyncStorage.removeItem('session_user_id');
          router.replace('/(auth)/login' as any);
        } 
      } else {
        router.replace('/(auth)/login' as any);
      }
      
      // Now only fetching application data from the current user
      const applicationRows = activeUserId ? await db.select().from(applicationsTable).where(eq(applicationsTable.userId, activeUserId))
        : []; 

      const categoryRows = activeUserId ? await db.select().from(categoriesTable).where(eq(categoriesTable.userId, activeUserId)) : [];
      const applicationstatuslogRows = await db.select().from(applicationStatusLogsTable);

      // Now only fetching target data from the current user
      const targetsTableRows = activeUserId ? await db.select().from(targetsTable).where(eq(targetsTable.userId, activeUserId))
        : [];
      
      setApplications(applicationRows);
      setCategories(categoryRows);
      setStatusLogs(applicationstatuslogRows);

      // setting the application colour design
      const savedTheme = await AsyncStorage.getItem(Theme_Key)
      if (savedTheme === 'dark') setIsDarkMode(true);

      await initNotifications();
    };
    
    load();
  }, []);


  // Handlers...
  const logout = async () => {
    await AsyncStorage.removeItem('session_user_id');
    setCurrentUser(null);
    setApplications([]);
    setCategories([]);
    setStatusLogs([]);
    router.replace('/(auth)/login' as any);
  }
  
  const toggleTheme = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    await AsyncStorage.setItem(Theme_Key, next ? 'dark' : 'light' );
  }

  // Fetch theme...
  const theme = isDarkMode ? myDarkTheme : myLightTheme;


  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <AuthContext.Provider value={{ currentUser, setCurrentUser, logout, loadUserData }}>
        <ApplicationContext.Provider value={{ applications, setApplications, categories, setCategories, statusLogs, setStatusLogs }}> 
          <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <PaperProvider theme={theme}>
              <Stack screenOptions={{ headerShown: false  }}>

                <Stack.Screen name="(auth)"/>
                <Stack.Screen name="(tabs)"/>

              </Stack>
            </PaperProvider>
          </SafeAreaProvider>
        </ApplicationContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  ); // ScreenOptions is a prop inside Stack, Screen is a subcomponent attached to Stack
}