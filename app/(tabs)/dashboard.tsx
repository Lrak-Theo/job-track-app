import { ApplicationContext } from "@/app/_layout";
import { db } from "@/db/client";
import { targetsTable } from "@/db/schema";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from "react";
import { Button, View } from 'react-native';
import { Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Target = {
    id: number;
    period: string;
    goalCount: number;
    categoryId: number | null;

}

export default function dashboard() {

    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;
    const { categories, applications } = context;

    const [targets, setTargets] = useState<Target[]>([]);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const rows = await db.select().from(targetsTable);
                setTargets(rows);

            };
            load();
        }, [])

    );

    const globalTargets = targets.filter(t => t.categoryId === null);
    const categoryTargets = targets.filter(t => t.categoryId !== null);


    let content;

    if (targets.length === 0) {
        content = <Text variant="bodyMedium">No targets set</Text>;
    } else {
        content = (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>

                <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 8 }}>Global</Text>
                    {globalTargets.map(target => (
                        <Card key={target.id} style={{ marginBottom: 10 }}>
                            <Card.Content>
                                <Text variant="labelMedium">{target.period}</Text>
                                <Text variant="titleMedium">Goal: {target.goalCount} applications</Text>
                                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginTop: 4 }}>All Industries</Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>

                <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 8 }}>By Category</Text>
                    {categoryTargets.length === 0 ? (
                        <Text variant="bodyMedium" style={{ opacity: 0.5 }}>None set</Text>
                    ) : (
                        categoryTargets.map(target => {
                            const category = categories.find(c => c.id === target.categoryId);
                            return (
                                <Card key={target.id} style={{ marginBottom: 10 }}>
                                    <Card.Content>
                                        <Text variant="labelMedium">{target.period}</Text>
                                        <Text variant="titleMedium">Goal: {target.goalCount} applications</Text>
                                        <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginTop: 4 }}>
                                            {category ? category.name : ''}
                                        </Text>
                                    </Card.Content>
                                </Card>
                            );
                        })
                    )}
                </View>

            </View>
        );
    }


    return (
        <SafeAreaView style={{ flex: 1, padding: 20}}>
            <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Targets</Text>

            <Button title="Add target" onPress={() => router.push({ pathname: '../target_add'})}/>

            {content}

            <Button title="Manage Targets" onPress={() => router.push({ pathname: '../target_manage'})} />
        </SafeAreaView>
    );

}