import { applicationsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { ApplicationContext, Category } from './_layout';

export default function AddApplication() {
    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;

    const { setApplications, categories } = context;

    const [jobTitle, setJobTitle] = useState('');
    const [jobCompany, setJobCompany] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [applyDate, setApplyDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [status, setStatus] = useState('Applied');

    const saveApplication = async () => {
        if (!jobTitle.trim() || categoryId === null) return;

        await db.insert(applicationsTable).values({
            jobTitle,
            jobCompany,
            categoryId,
            applyDate: applyDate.toISOString().split('T')[0],
            status
        });

        const rows = await db.select().from(applicationsTable);
        setApplications(rows);

        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <View style={{ padding: 20 }}>

                {/* Added an X icon to cancel adding an application */}
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
                    <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>

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

                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{ borderWidth: 1, marginVertical: 5, padding: 10 }}
                >
                    <Text>{applyDate.toLocaleDateString()}</Text>
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
  

                <Button
                    title="Save"
                    onPress={saveApplication}
                    disabled={!jobTitle.trim()}
                />
            </View>
        </SafeAreaView>
    );
}