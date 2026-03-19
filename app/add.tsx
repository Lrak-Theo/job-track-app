import { applicationsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { ApplicationContext } from './_layout';

export default function AddAplication() {
    const router = useRouter();
    const context = useContext(ApplicationContext);


    if (!context) return null;

    const { setApplications } = context;

    const [jobTitle, setJobTitle] = useState('');
    const [jobCompany, setJobCompany] = useState('');
    const [applyDate, setApplyDate] = useState('');

    const saveApplication = async() => {
        if (!jobTitle.trim()) return;

        await db.insert(applicationsTable).values({
            jobTitle,
            jobCompany,
            applyDate,
        });

        const rows = await db.select().from(applicationsTable);
        setApplications(rows);

        router.back();
    };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <TextInput
          placeholder="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
          style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        />
        <TextInput
          placeholder="Company"
          value={jobCompany}
          onChangeText={setJobCompany}
          style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        />
        <TextInput
          placeholder="Apply Date (YYYY-MM-DD)"
          value={applyDate}
          onChangeText={setApplyDate}
          style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        />
        <Button
          title="Save"
          onPress={saveApplication}
          disabled={!jobTitle.trim()}
        />
      </View>
    </SafeAreaView>
  );


}