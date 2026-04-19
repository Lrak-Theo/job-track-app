import { categoriesTable, targetsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Button, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { AuthContext } from './_layout';

export default function AddTarget() {

    type Category = {
        id: number;
        name: string;
        color: string;
    }

    const router = useRouter();

    const authContext = useContext(AuthContext);
    const currentUser = authContext?.currentUser;

    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const [goalCount, setGoalCount] = useState('');

    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const load = async () => {
            const rows = await db.select().from(categoriesTable);
            setCategories(rows);
        };
        load();
    }, []);

    const saveTarget = async () => {
        if (!goalCount.trim() || categoryId === null) return;

        await db.insert(targetsTable).values({
            userId: currentUser!.id,
            period,
            goalCount: parseInt(goalCount),
            categoryId,
            createdAt: new Date().toISOString().split('T')[0],
        });

        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <View style={{ padding: 20 }}>

                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20}}>
                    <Ionicons name="close" size={28} color={"#666"}/>
                </TouchableOpacity>

                <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: '600' }}>
                    Period
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 15 }}>
                    <Chip selected={period === 'weekly'} onPress={() => setPeriod('weekly')}>Weekly</Chip>

                    <Chip selected={period === 'monthly'} onPress={() => setPeriod('monthly')}>Monthly</Chip>

                </View>

                <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: '600' }}>
                    Category
                </Text>  

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                    {categories.map(category => (
                        <Chip key={category.id} selected={categoryId === category.id} onPress={() => setCategoryId(category.id)} 
                              style={{ backgroundColor: categoryId === category.id ? category.color : '#f0f0f0' }}>
                            {category.name}
                        </Chip>
                    ))}       
                </View>

                <TextInput placeholder="10 jobs" value={goalCount} onChangeText={setGoalCount} keyboardType="numeric"
                            style={{ borderWidth: 1, marginVertical: 5, padding: 5}}/>

                <Button title="Save" onPress={saveTarget} disabled={!goalCount.trim() || categoryId === null }/>
            </View>
        </SafeAreaView>
    )
}