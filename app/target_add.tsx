import { categoriesTable, targetsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
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
    const [categoryId, setCategoryId] = useState<number | null | undefined>(undefined);
    const [categories, setCategories] = useState<Category[]>([]);

    // Effects...
    useEffect(() => {
        db.select().from(categoriesTable).then(setCategories);
    }, []);

    // Handler...
    const saveTarget = async () => {
        if (!goalCount.trim() || parseInt(goalCount) < 1 || categoryId === undefined) return;

        await db.insert(targetsTable).values({
            userId: currentUser!.id,
            period: 'weekly',
            goalCount: parseInt(goalCount),
            categoryId,
            createdAt: new Date().toISOString().split('T')[0],
        });

        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1, padding: 20 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close" />
                    <Text variant="titleLarge" style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}>Add Target</Text>
                </View>

                <Divider style={{ marginBottom: 20 }} />

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
                    disabled={!goalCount.trim() || parseInt(goalCount) < 1 || categoryId === undefined}
                    accessibilityLabel="Save target"
                >
                    Save
                </Button>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
