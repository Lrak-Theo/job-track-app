import { categoriesTable, targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Card, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { AuthContext } from './_layout';

type Target = { id: number; period: string; goalCount: number; categoryId: number | null; };
type Category = { id: number; name: string; color: string; };

export default function ManageTargets() {

    // Set context and theme
    const router = useRouter();
    const theme = useTheme();
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.currentUser;

    // Set state values
    const [targets, setTargets] = useState<Target[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Load targets and categories on focus
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const [rows, cats] = await Promise.all([
                    db.select().from(targetsTable).where(eq(targetsTable.userId, currentUser!.id)),
                    db.select().from(categoriesTable),
                ]);
                setTargets(rows);
                setCategories(cats);
            };
            load();
        }, [])
    );

    // Handlers...
    const deleteTarget = (id: number) => {
        Alert.alert('Delete Target', 'Remove this target?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await db.delete(targetsTable).where(eq(targetsTable.id, id));
                    setTargets(prev => prev.filter(t => t.id !== id));
                }
            }
        ]);
    };

    // Derived Constants
    const renderTarget = (target: Target) => {
        const label = target.categoryId === null
            ? 'All Industries'
            : categories.find(c => c.id === target.categoryId)?.name ?? 'Unknown';

        return (
            <Card key={target.id} style={{ marginBottom: 10, backgroundColor: theme.colors.surface }}>
                <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text variant="labelSmall" style={{ opacity: 0.6 }}>Weekly · {label}</Text>
                        <Text variant="titleMedium">{target.goalCount} applications</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton icon="pencil-outline" size={20} onPress={() => router.push({ pathname: '/target_edit', params: { id: String(target.id) } })} accessibilityLabel="Edit target" />
                        <IconButton icon="delete-outline" size={20} iconColor={theme.colors.error} onPress={() => deleteTarget(target.id)} accessibilityLabel="Delete target" />
                    </View>
                </Card.Content>
            </Card>
        );
    };

    const globalTargets = targets.filter(t => t.categoryId === null);
    const categoryTargets = targets.filter(t => t.categoryId !== null);


    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ padding: 20 }}>

                <Text variant="headlineMedium" style={{ fontFamily: 'Times New Roman', fontWeight: 'bold', marginBottom: 16 }}>Manage Targets</Text>

                {targets.length === 0 ? (
                    <>
                        <Text variant="bodyMedium" style={{ opacity: 0.5, marginBottom: 16 }}>No targets set yet.</Text>
                        <Button mode="outlined" onPress={() => router.push({ pathname: '../target_add' })} accessibilityLabel="Add a target">Add target</Button>
                    </>
                ) : (
                    <>
                        <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>Global</Text>
                        {globalTargets.length === 0
                            ? <Text variant="bodyMedium" style={{ opacity: 0.5, marginBottom: 12 }}>No global target set.</Text>
                            : globalTargets.map(renderTarget)
                        }

                        <Divider style={{ marginVertical: 12 }} />

                        <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 8 }}>By Category</Text>
                        {categoryTargets.length === 0
                            ? <Text variant="bodyMedium" style={{ opacity: 0.5, marginBottom: 12 }}>No category targets set.</Text>
                            : categoryTargets.map(renderTarget)
                        }
                    </>
                )}

            </View>
        </SafeAreaView>
    );
}
