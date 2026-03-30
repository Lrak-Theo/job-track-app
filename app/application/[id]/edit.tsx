import { applicationsTable, applicationStatusLogsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../db/client';
import { Application, ApplicationContext, Category } from '../../_layout';

export default function EditApplication() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(ApplicationContext);

  if (!context) return null;

  const { applications, categories, setApplications } = context;

  const application = applications.find(
    (a: Application) => a.id === Number(id)
  );

  if (!application) return null;

  const [jobTitle, setJobTitle] = useState(application.jobTitle);
  const [jobCompany, setJobCompany] = useState(application.jobCompany);
  const [categoryId, setCategoryId] = useState(application.categoryId);
  const [applyDate, setApplyDate] = useState(application.applyDate);
  const [status, setStatus] = useState(application.status);

  const saveChanges = async () => {
    if (!jobTitle.trim() || categoryId === null) return;

    await db.update(applicationsTable)
      .set({ 
        jobTitle, 
        jobCompany, 
        categoryId,
        applyDate,
        status 
      })
      .where(eq(applicationsTable.id, Number(id)));
    
    await db.insert(applicationStatusLogsTable).values({
      applicationId: Number(id),
      status,
      changedAt: new Date().toISOString().split('T')[0],
    });

    const rows = await db.select().from(applicationsTable);
    setApplications(rows);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView style={{ padding: 20 }}>
        {/* Close button */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="close" size={28} color="#666" />
        </TouchableOpacity>

        {/* Job Title */}
        <TextInput
          value={jobTitle}
          onChangeText={setJobTitle}
          placeholder="Job Title"
          style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        />

        {/* Company */}
        <TextInput
          value={jobCompany}
          onChangeText={setJobCompany}
          placeholder="Company"
          style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        />

        {/* Category Selection */}
        <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: '600' }}>
          Category
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
          {categories.map((category: Category) => (
            <Chip
              key={category.id}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
              style={{ backgroundColor: categoryId === category.id ? category.color : '#f0f0f0' }}
            >
              {category.name}
            </Chip>
          ))}
        </View>

        {/* Apply Date */}
        <TextInput
          value={applyDate}
          onChangeText={setApplyDate}
          placeholder="Apply Date (YYYY-MM-DD)"
          style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
        />

        {/* Status Selection */}
        <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: '600' }}>
          Status
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <Chip selected={status === 'Applied'} onPress={() => setStatus('Applied')}>
            Applied
          </Chip>
          <Chip selected={status === 'Interviewed'} onPress={() => setStatus('Interviewed')}>
            Interviewed
          </Chip>
          <Chip selected={status === 'Rejected'} onPress={() => setStatus('Rejected')}>
            Rejected
          </Chip>
          <Chip selected={status === 'No Response'} onPress={() => setStatus('No Response')}>
            No Response
          </Chip>
          <Chip selected={status === 'No Status'} onPress={() => setStatus('No Status')}>
            No Status
          </Chip>
        </View>

        {/* Save Button */}
        <Button 
          title="Save Changes" 
          onPress={saveChanges}
          disabled={!jobTitle.trim() || categoryId === null}
        />
      </ScrollView>
    </SafeAreaView>
  );
}