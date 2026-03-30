import { targetsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';

export default function EditTarget() {
    
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id:string }>();

    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const [goalCount, setGoalCount] = useState('');

    useEffect(() => {
        const load = async () => {
            const rows = await db.select().from(targetsTable).where(eq(targetsTable.id, Number(id)));

            if (rows.length === 0) return;
            const target = rows[0];
            setPeriod(target.period as 'weekly' | 'monthly');
            setGoalCount(String(target.goalCount));

        };
        load();
    }, []);


    const saveTarget = async () => {
        if (!goalCount.trim()) return; 

        await db.update(targetsTable).set({ period, goalCount: parseInt(goalCount) }).where(eq(targetsTable.id, Number(id)));
        
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <View style={{ padding: 20 }}>

                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
                    <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>

                <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: '600' }}>
                    Period
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 15 }}>
                    <Chip selected={period === 'weekly'} onPress={() => setPeriod('weekly')}>Weekly</Chip>
                    <Chip selected={period === 'monthly'} onPress={() => setPeriod('monthly')}>Monthly</Chip>
                </View>

                <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: '600' }}>
                    Goal
                </Text>
                <TextInput
                    placeholder="10 jobs"
                    value={goalCount}
                    onChangeText={setGoalCount}
                    keyboardType="numeric"
                    style={{ borderWidth: 1, marginVertical: 5, padding: 5 }}
                />

                <Button title="Save" onPress={saveTarget} disabled={!goalCount.trim()} />

            </View>
        </SafeAreaView>
    );

}