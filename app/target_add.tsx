import { categoriesTable, targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, View } from 'react-native';
import FormField from '@/components/ui/form-field';
import { Button, Chip, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { AuthContext } from './_layout';

type Category = { id: number; name: string; color: string; };

export default function AddTarget() {

    // Set context and theme
    const router = useRouter();
    const theme = useTheme();
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.currentUser;

    // Set state values
    const [goalCount, setGoalCount] = useState('');
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const [categoryId, setCategoryId] = useState<number | null | undefined>(undefined);
    const [categories, setCategories] = useState<Category[]>([]);

    // Effects...
    useEffect(() => {
        if (!currentUser?.id) return;
        db.select().from(categoriesTable).where(eq(categoriesTable.userId, currentUser.id)).then(setCategories);
    }, []);

    // Handler...
    const saveTarget = async () => {
        if (!goalCount.trim() || parseInt(goalCount) < 1 || categoryId === undefined) return;

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
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, padding: 20 }}>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close" />
                    <Text variant="titleLarge" style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}>Add Target</Text>
                </View>

                <Divider style={{ marginBottom: 20 }} />

                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>Period</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                    <Chip
                        selected={period === 'weekly'}
                        onPress={() => setPeriod('weekly')}
                        style={{ backgroundColor: period === 'weekly' ? theme.colors.secondary : undefined }}
                        accessibilityLabel="Select weekly period"
                    >
                        Weekly
                    </Chip>
                    <Chip
                        selected={period === 'monthly'}
                        onPress={() => setPeriod('monthly')}
                        style={{ backgroundColor: period === 'monthly' ? theme.colors.secondary : undefined }}
                        accessibilityLabel="Select monthly period"
                    >
                        Monthly
                    </Chip>
                </View>

                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    <Chip
                        selected={categoryId === null}
                        onPress={() => setCategoryId(null)}
                        style={{ backgroundColor: categoryId === null ? theme.colors.secondary : undefined }}
                        accessibilityLabel="Select all industries"
                    >
                        All Industries
                    </Chip>
                    {categories.map(cat => (
                        <Chip
                            key={cat.id}
                            selected={categoryId === cat.id}
                            onPress={() => setCategoryId(cat.id)}
                            style={{ backgroundColor: categoryId === cat.id ? theme.colors.secondary : undefined }}
                            accessibilityLabel={`Select category ${cat.name}`}
                        >
                            {cat.name}
                        </Chip>
                    ))}
                </View>

                <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>{period === 'weekly' ? 'Weekly' : 'Monthly'} Goal</Text>
                <FormField label="Number of applications" value={goalCount} onChangeText={setGoalCount} keyboardType="numeric" returnKeyType="done" />

                <Button
                    mode="contained"
                    onPress={saveTarget}
                    disabled={!goalCount.trim() || parseInt(goalCount) < 1 || categoryId === undefined}
                    accessibilityLabel="Save target"
                >
                    Save
                </Button>

            </View>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
