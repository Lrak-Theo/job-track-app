import { applicationsTable, applicationStatusLogsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { View } from 'react-native';
import { Button, Chip, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../db/client';
import { Application, ApplicationContext, Category } from '../_layout';

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

    // Set state value
    const [status, setStatus] = useState(application?.status ?? 'Applied');

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

    const deleteApplication = async () => {
        await db.delete(applicationsTable)
            .where(eq(applicationsTable.id, Number(id)));

        const rows = await db.select().from(applicationsTable);
        setApplications(rows);

        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ padding: 20 }}>

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

                {/* Status — interactive chips */}
                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>Status</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <Chip selected={status === 'Applied'} onPress={() => setStatus('Applied')} accessibilityLabel="Set status to Applied">
                        Applied
                    </Chip>
                    <Chip selected={status === 'Interviewing'} onPress={() => setStatus('Interviewing')} accessibilityLabel="Set status to Interviewing">
                        Interviewing
                    </Chip>
                    <Chip selected={status === 'Offered'} onPress={() => setStatus('Offered')} accessibilityLabel="Set status to Offered">
                        Offered
                    </Chip>
                    <Chip selected={status === 'Rejected'} onPress={() => setStatus('Rejected')} accessibilityLabel="Set status to Rejected">
                        Rejected
                    </Chip>
                    <Chip selected={status === 'Withdrawn'} onPress={() => setStatus('Withdrawn')} accessibilityLabel="Set status to Withdrawn">
                        Withdrawn
                    </Chip>
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
                    style={{ marginBottom: 10, borderColor: theme.colors.error }}
                    accessibilityLabel="Delete this application"
                >
                    Delete
                </Button>

            </View>
        </SafeAreaView>
    );
}
