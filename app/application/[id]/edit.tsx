import { applicationsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../db/client';
import { Application, ApplicationContext } from '../../_layout';

export default function EditApplication() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;

    const { applications, setApplications } = context;

    const application = applications.find(
        (a: Application) => a.id === Number(id)
    );

    if (!application) return null;

    const [jobTitle, setJobTitle] = useState(application.jobTitle);
    const [jobCompany, setJobCompany] = useState(application.jobCompany);
    const [applyDate, setApplyDate] = useState(application.applyDate);

    const saveChanges = async() => {
        await db.update(applicationsTable)
        .set({ jobTitle, jobCompany, applyDate })
        .where(eq(applicationsTable.id, Number(id)));

        const rows = await db.select().from(applicationsTable);
        setApplications(rows);

        router.back();

    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
            <TextInput
            value={jobTitle}
            onChangeText={setJobTitle}
            style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
            />
            <TextInput
            value={jobCompany}
            onChangeText={setJobCompany}
            style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
            />
            <TextInput
            value={applyDate}
            onChangeText={setApplyDate}
            style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
            />
            <Button title="Save Changes" onPress={saveChanges} />
        </View>
        </SafeAreaView>
    );
    }