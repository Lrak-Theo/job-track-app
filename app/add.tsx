import { applicationsTable, applicationStatusLogsTable } from '@/db/schema';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { ApplicationContext, AuthContext, Category } from './_layout';


export default function AddApplication() {

    // Set context and theme
    const router = useRouter();
    const context = useContext(ApplicationContext);
    const authContext = useContext(AuthContext);
    const theme = useTheme(); 

    // Set state values
    const [jobTitle, setJobTitle] = useState('');
    const [jobCompany, setJobCompany] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [applyDate, setApplyDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Early error handling
    if (!context) return null;

    // Derived Constants
    const { setApplications, categories, setStatusLogs } = context;
    const currentUser = authContext?.currentUser;

    // Handler...
    const saveApplication = async () => {
        if (!jobTitle.trim() || categoryId === null) return;

        const result = await db.insert(applicationsTable).values({
            userId: currentUser!.id,
            jobTitle,
            jobCompany,
            categoryId,
            applyDate: applyDate.toISOString().split('T')[0],
            status: 'Applied',
        }).returning();

        await db.insert(applicationStatusLogsTable).values({
            applicationId: result[0].id,
            status: 'Applied',
            changedAt: new Date().toISOString().split('T')[0],
        });

        const rows = await db.select().from(applicationsTable);
        const updatedLogs = await db.select().from(applicationStatusLogsTable);

        setApplications(rows);
        setStatusLogs(updatedLogs);

        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1, padding: 20 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                {/* Header row: close button + title */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Cancel and go back" style={{ margin: 0 }} />
                    <Text variant="headlineSmall" style={{ marginLeft: 8 }}>Add Application</Text>
                </View>

                <TextInput
                    label="Job Title"
                    value={jobTitle}
                    onChangeText={setJobTitle}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                    dense
                    accessibilityLabel="Job title"
                />
                <TextInput
                    label="Company"
                    value={jobCompany}
                    onChangeText={setJobCompany}
                    style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
                    dense
                    accessibilityLabel="Company name"
                />

                <Divider style={{ marginBottom: 16 }} />

                {/* Category Selection */}
                <Text variant="labelSmall" style={{ marginBottom: 8, opacity: 0.6 }}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {categories.map((category: Category) => (
                        <Chip
                            key={category.id}
                            selected={categoryId === category.id}
                            onPress={() => setCategoryId(category.id)}
                            style={{ backgroundColor: categoryId === category.id ? category.color : undefined }}
                            accessibilityLabel={`Select category ${category.name}`}
                        >
                            {category.name}
                        </Chip>
                    ))}
                </View>

                <Divider style={{ marginBottom: 16 }} />

                {/* Date Applied */}
                <Text variant="labelSmall" style={{ marginBottom: 8, opacity: 0.6 }}>Date Applied</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} accessibilityLabel={`Date applied, currently ${applyDate.toLocaleDateString()}`}>
                    <TextInput
                        value={applyDate.toLocaleDateString()}
                        editable={false}
                        style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
                        dense
                        right={<TextInput.Icon icon="calendar" />}
                    />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={applyDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setApplyDate(selectedDate);
                        }}
                    />
                )}

                <Button
                    mode="contained"
                    onPress={saveApplication}
                    disabled={!jobTitle.trim() || categoryId === null}
                    accessibilityLabel="Save application"
                    style={{ marginTop: 8 }}
                >
                    Save
                </Button>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
