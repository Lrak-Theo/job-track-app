import { targetsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { AuthContext } from './_layout';

type Target = {
    id: number;
    period: string;
    goalCount: number;
    categoryId: number | null;
}

export default function ManageTargets() {

    const router = useRouter();
    const [targets, setTargets] = useState<Target[]>([]);

    const authContext = useContext(AuthContext);
    const currentUser = authContext?.currentUser;

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const rows = await db.select().from(targetsTable).where(eq(targetsTable.userId, currentUser!.id));
                setTargets(rows);
            };
            load();
        }, [])
    );

    const deleteTarget = async (id: number) => {
        await db.delete(targetsTable).where(eq(targetsTable.id, id));
        const rows = await db.select().from(targetsTable).where(eq(targetsTable.userId, currentUser!.id));
        setTargets(rows);
    };

    const globalTargets = targets.filter(t => t.categoryId === null);
    const categoryTargets = targets.filter(t => t.categoryId !== null);




    let content;

    if (targets.length === 0) {
        content = <Text variant="bodyMedium">No targets set</Text>;
    } else {
        content = (
            <>
                <Text variant="titleSmall" style={{ marginBottom: 8 }}>Global</Text>
                {globalTargets.map(target => (
                    <Card key={target.id} style={{ marginBottom: 10 }}>
                        <Card.Content>
                            <Text variant="labelMedium">{target.period}</Text>
                            <Text variant="titleMedium">Goal: {target.goalCount} applications</Text>
                        </Card.Content>
                        <Card.Actions>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/target_edit', params: { id: String(target.id) } })}>
                                <Ionicons name="pencil" size={20} color="#666" />
                            </TouchableOpacity>
                        </Card.Actions>
                    </Card>
                ))}

                <Text variant="titleSmall" style={{ marginTop: 16, marginBottom: 8 }}>By Category</Text>
                {categoryTargets.length === 0 ? (
                    <Text variant="bodyMedium" style={{ opacity: 0.5 }}>No category targets set</Text>
                ) : (
                    categoryTargets.map(target => (
                        <Card key={target.id} style={{ marginBottom: 10 }}>
                            <Card.Content>
                                <Text variant="labelMedium">{target.period}</Text>
                                <Text variant="titleMedium">Goal: {target.goalCount} applications</Text>
                            </Card.Content>
                            <Card.Actions>
                                <TouchableOpacity onPress={() => router.push({ pathname: '/target_edit', params: { id: String(target.id) } })}>
                                    <Ionicons name="pencil" size={20} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteTarget(target.id)}>
                                    <Ionicons name="trash" size={20} color="#666" />
                                </TouchableOpacity>
                            </Card.Actions>
                        </Card>
                    ))
                )}
            </>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Manage</Text>
            {content}
        </SafeAreaView>
    );
}