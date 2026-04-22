import { applicationsTable, applicationStatusLogsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../db/client';
import { Application, ApplicationContext, Category } from '../_layout';

const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'];

export default function ApplicationDetail() {

    // Set context and theme
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const context = useContext(ApplicationContext);
    const theme = useTheme();

    // Derive application for state value
    const application = context?.applications.find(
        (a: Application) => a.id === Number(id)
    );

    // Set state values
    const [status, setStatus] = useState(application?.status ?? 'Applied');
    const [notes, setNotes] = useState(application?.notes ?? '');

    // Early error handling
    if (!context) return null;
    if (!application) return null;

    // Derived constant
    const { categories, setApplications, setStatusLogs } = context;
    const category = categories.find((c: Category) => c.id === application.categoryId);

    // Handlers...
    const updateStatus = async () => {
        await db.update(applicationsTable)
            .set({ status })
            .where(eq(applicationsTable.id, Number(id)));

        await db.insert(applicationStatusLogsTable).values({
            applicationId: Number(id),
            status,
            changedAt: new Date().toISOString().split('T')[0],
        });

        const rows = await db.select().from(applicationsTable);
        const updatedLogs = await db.select().from(applicationStatusLogsTable);
        setApplications(rows);
        setStatusLogs(updatedLogs);
    };

    const saveNotes = async () => {
        await db.update(applicationsTable)
            .set({ notes: notes.trim() || null })
            .where(eq(applicationsTable.id, Number(id)));

        const rows = await db.select().from(applicationsTable);
        setApplications(rows);
    };

    const deleteApplication = async () => {
        await db.delete(applicationStatusLogsTable)
            .where(eq(applicationStatusLogsTable.applicationId, Number(id)));

        await db.delete(applicationsTable)
            .where(eq(applicationsTable.id, Number(id)));

        const rows = await db.select().from(applicationsTable);
        const updatedLogs = await db.select().from(applicationStatusLogsTable);
        setApplications(rows);
        setStatusLogs(updatedLogs);

        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView style={{ padding: 20 }}>

                {/* Header row: back button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Go back" style={{ margin: 0 }} />
                </View>

                {/* Job title + company */}
                <Text variant="headlineMedium">{application.jobTitle}</Text>
                <Text variant="bodyLarge" style={{ marginTop: 4 }}>{application.jobCompany}</Text>

                {/* Category dot + name */}
                {category && (
                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: category.color }} />
                        <Text variant="bodyMedium">{category.name}</Text>
                    </View>
                )}

                <Divider style={{ marginVertical: 20 }} />

                {/* Date applied */}
                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 4 }}>Date Applied</Text>
                <Text variant="bodyMedium" style={{ marginBottom: 16 }}>{application.applyDate}</Text>

                {/* Notes — inline editable */}
                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>Notes</Text>
                <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add a note..."
                    multiline
                    numberOfLines={3}
                    style={{ marginBottom: 8, backgroundColor: theme.colors.surface }}
                    accessibilityLabel="Notes"
                />
                <Button
                    mode="text"
                    onPress={saveNotes}
                    disabled={notes.trim() === (application.notes ?? '')}
                    accessibilityLabel="Save notes"
                    style={{ alignSelf: 'flex-end', marginBottom: 16 }}
                    compact
                >
                    Save Notes
                </Button>

                <Divider style={{ marginVertical: 4 }} />

                {/* Status — interactive chips */}
                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8, marginTop: 16 }}>Status</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {STATUSES.map((s) => {
                        const isSelected = status === s;
                        return (
                            <Chip
                                key={s}
                                selected={isSelected}
                                onPress={() => setStatus(s)}
                                style={{
                                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
                                }}
                                textStyle={{
                                    color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
                                }}
                                accessibilityLabel={`Set status to ${s}`}
                            >
                                {s}
                            </Chip>
                        );
                    })}
                </View>

                <Button
                    mode="contained-tonal"
                    onPress={updateStatus}
                    disabled={status === application.status}
                    accessibilityLabel="Save status update"
                    style={{ marginBottom: 4 }}
                >
                    Update Status
                </Button>

                <Divider style={{ marginVertical: 20 }} />

                <Button
                    mode="contained"
                    onPress={() => router.push({
                        pathname: '../application/[id]/edit',
                        params: { id }
                    })}
                    style={{ marginBottom: 10 }}
                    accessibilityLabel="Edit this application"
                >
                    Edit
                </Button>

                <Button
                    mode="outlined"
                    textColor={theme.colors.error}
                    onPress={deleteApplication}
                    style={{ marginBottom: 32, borderColor: theme.colors.error }}
                    accessibilityLabel="Delete this application"
                >
                    Delete
                </Button>

            </ScrollView>
        </SafeAreaView>
    );
}
