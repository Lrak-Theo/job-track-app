import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../db/client';
import { applicationsTable } from '../../db/schema';
import { Application, ApplicationContext, Category } from '../_layout';

export default function ApplicationDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;

    const { applications, categories, setApplications } = context;

    const application = applications.find(
        (a: Application) => a.id === Number(id)
    );

    if (!application) return null;

    const category = categories.find((c: Category) => c.id === application.categoryId);

    const deleteApplication = async () => {
        await db.delete(applicationsTable)
        .where(eq(applicationsTable.id, Number(id)));

        const rows = await db.select().from(applicationsTable);
        setApplications(rows);

        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
            <Text variant="headlineMedium">{application.jobTitle}</Text>
            <Text variant="bodyLarge" style={{ marginTop: 5 }}>{application.jobCompany}</Text>
            
            {/* Display category name with its color */}
            {category && (
            <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View 
                style={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: 6, 
                    backgroundColor: category.color 
                }} 
                />
                <Text variant="bodyMedium">{category.name}</Text>
            </View>
            )}

            <Text variant="bodyMedium" style={{ marginTop: 5, opacity: 0.6 }}>{application.applyDate}</Text>
            <Text variant="bodyMedium" style={{ marginTop: 5, opacity: 0.6 }}>{application.status}</Text>

            <Divider style={{ marginVertical: 20 }} />

            <Button
            mode="contained"
            onPress={() => router.push({
                pathname: '../application/[id]/edit',
                params: { id }
            })}
            style={{ marginBottom: 10 }}
            >
            Edit
            </Button>

            <Button
            mode="contained"
            buttonColor="red"
            onPress={deleteApplication}
            style={{ marginBottom: 10 }}
            >
            Delete
            </Button>

            <Button mode="outlined" onPress={() => router.back()}>
            Back
            </Button>
        </View>
        </SafeAreaView>
    );
}