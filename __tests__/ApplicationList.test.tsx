import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ListPage from '../app/(tabs)/application_list';

// Create a mock _layout to remove import dependencies that jest won't accept
jest.mock('../app/_layout', () => {
  const React = require('react');
  return {
    ApplicationContext: React.createContext(null),
    ThemeContext: React.createContext({ isDarkMode: false, toggleTheme: () => {} }),
    AuthContext: React.createContext(null),
  };
});

jest.mock('@/db/client', () => ({
  db: { select: jest.fn(), insert: jest.fn() },
  sqlite: {},
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-drizzle-studio-plugin', () => ({
  useDrizzleStudio: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file://cache/',
  writeAsStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('react-native-paper', () => {
  const { View, Text, TextInput, Pressable } = require('react-native');
  const Card = ({ children }: any) => <View>{children}</View>;
  Card.Content = ({ children }: any) => <View>{children}</View>;
  return {
    Text: ({ children, style }: any) => <Text style={style}>{children}</Text>,
    TextInput: (props: any) => <TextInput {...props} />,
    Chip: ({ children, onPress }: any) => <Pressable onPress={onPress}><Text>{children}</Text></Pressable>,
    Divider: () => <View />,
    FAB: ({ onPress }: any) => <Pressable onPress={onPress}><Text>Add</Text></Pressable>,
    IconButton: ({ onPress }: any) => <Pressable onPress={onPress}><Text>Icon</Text></Pressable>,
    Button: ({ children, onPress }: any) => <Pressable onPress={onPress}><Text>{children}</Text></Pressable>,
    Card,
    useTheme: () => ({
      colors: { background: '#FEF5EF', surface: '#FFFFFF', primary: '#9D5C63', onPrimary: '#FFFFFF', onSurface: '#584B53' }
    }),
  };
});

// Break 

import { ApplicationContext } from '../app/_layout';

const mockApplication = {
  id: 1,
  jobTitle: 'Software Developer',
  jobCompany: 'Red Hat',
  categoryId: 1,
  applyDate: '2026-02-20',
  status: 'Applied',
  notes: null,
  userId: 1,
};

const mockCategory = {
  id: 1,
  name: 'Tech',
  color: '#3B82F6',
  userId: 1,
};

describe('ListPage', () => {
  it('renders the heading and application card', async () => {
    const { getByText } = render(
      <ApplicationContext.Provider value={{
        applications: [mockApplication],
        categories: [mockCategory],
        setApplications: jest.fn(),
        setCategories: jest.fn(),
        statusLogs: [],
        setStatusLogs: jest.fn(),
      }}>
        <ListPage />
      </ApplicationContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Applications')).toBeTruthy();
      expect(getByText('Red Hat')).toBeTruthy();
      expect(getByText('Software Developer')).toBeTruthy();
    });
  });

  it('shows empty state when no applications exist', async () => {
    const { getByText } = render(
      <ApplicationContext.Provider value={{
        applications: [],
        categories: [],
        setApplications: jest.fn(),
        setCategories: jest.fn(),
        statusLogs: [],
        setStatusLogs: jest.fn(),
      }}>
        <ListPage />
      </ApplicationContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('No applications yet')).toBeTruthy();
    });
  });
});