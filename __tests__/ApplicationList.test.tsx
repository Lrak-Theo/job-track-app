import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ListPage from '../app/(tabs)/application_list';
import { ApplicationContext } from '../app/_layout';


jest.mock('@/db/client', () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
    },
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
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
        Text: ({ children, variant, style }: any) => <Text style={style}>{children}</Text>,
        TextInput: (props: any) => <TextInput {...props} />,
        Chip: ({ children, onPress }: any) => <Pressable onPress={onPress}><Text>{children}</Text></Pressable>,
        Divider: () => <View />,
        FAB: ({ onPress }: any) => <Pressable onPress={onPress}><Text>Add</Text></Pressable>,
        Card,
    };
});

const mockApplication = {
    id: 1,
    jobTitle: 'Software Developer',
    jobCompany: 'Redhat',
    categoryId: 1,
    applyDate: '2026-02-20',
    status: 'Applied',
    notes: null,
};

const mockCategory = {
    id: 1,
    name: 'Tech',
    color: '#3B82F6',
};

describe('ListPage', () => {
    it('renders the application and heading', async () => {
        const { getByText } = render(
            <ApplicationContext.Provider value={{
                applications: [mockApplication],
                categories: [mockCategory],
                setApplications: jest.fn(),
                setCategories: jest.fn(),
            }}>
                <ListPage />
            </ApplicationContext.Provider>
        );

        await waitFor(() => {
            expect(getByText('Applications')).toBeTruthy();
            expect(getByText('Redhat')).toBeTruthy();
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
            }}>
                <ListPage />
            </ApplicationContext.Provider>
        );

        await waitFor(() => {
            expect(getByText('No applications found')).toBeTruthy();
        });
    });
});