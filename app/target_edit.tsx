import { targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';

export default function EditTarget() {

    // Set context and theme
    const router = useRouter();
    const theme = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Set state values
    const [goalCount, setGoalCount] = useState('');

    // Effects
    useEffect(() => {
        db.select().from(targetsTable).where(eq(targetsTable.id, Number(id))).then(rows => {
            if (rows.length > 0) setGoalCount(String(rows[0].goalCount));
        });
    }, []);

    // Handler...
    const saveTarget = async () => {
        if (!goalCount.trim() || parseInt(goalCount) < 1) return;
        await db.update(targetsTable).set({ goalCount: parseInt(goalCount) }).where(eq(targetsTable.id, Number(id)));
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1, padding: 20 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close" />
                    <Text variant="titleLarge" style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}>Edit Target</Text>
                </View>

                <Divider style={{ marginBottom: 20 }} />

                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>Weekly Goal</Text>
                <TextInput
                    label="Number of applications"
                    value={goalCount}
                    onChangeText={setGoalCount}
                    keyboardType="numeric"
                    mode="outlined"
                    style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}
                    accessibilityLabel="Weekly goal count"
                />

                <Button
                    mode="contained"
                    onPress={saveTarget}
                    disabled={!goalCount.trim() || parseInt(goalCount) < 1}
                    accessibilityLabel="Save target"
                >
                    Save
                </Button>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
