import { applicationsTable } from '@/db/schema';
import DateTimePicker from '@react-native-community/datetimepicker';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../db/client';
import { Application, ApplicationContext, Category } from '../../_layout';

export default function EditApplication() {

  // Set context and theme
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(ApplicationContext);
  const theme = useTheme(); // Moved above conditional return to satisfy Rules of Hooks


  // Deriving applications...
  const application = context?.applications.find(
    (a: Application) => a.id === Number(id)
  );


  // Set state values
  const [jobTitle, setJobTitle] = useState(application?.jobTitle ?? '');
  const [jobCompany, setJobCompany] = useState(application?.jobCompany ?? '');
  const [categoryId, setCategoryId] = useState(application?.categoryId ?? null);
  const [applyDate, setApplyDate] = useState(new Date(application?.applyDate ?? new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Early error handling
  if (!context) return null;
  if (!application) return null;

  // Derived constant
  const { categories, setApplications } = context;

  // Handler...
  const saveChanges = async () => {
    if (!jobTitle.trim() || categoryId === null) return;

    await db.update(applicationsTable)
      .set({
        jobTitle,
        jobCompany,
        categoryId,
        applyDate: applyDate.toISOString().split('T')[0],
      })
      .where(eq(applicationsTable.id, Number(id)));

    const rows = await db.select().from(applicationsTable);
    setApplications(rows);
    router.back();
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView style={{ padding: 20 }}>

        {/* Header row: close button + title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Cancel and go back" style={{ margin: 0 }} />
          <Text variant="headlineSmall" style={{ marginLeft: 8 }}>Edit Application</Text>
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

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={saveChanges}
          disabled={!jobTitle.trim() || categoryId === null}
          accessibilityLabel="Save changes"
          style={{ marginBottom: 20 }}
        >
          Save Changes
        </Button>

      </ScrollView>
    </SafeAreaView>
  );
}
