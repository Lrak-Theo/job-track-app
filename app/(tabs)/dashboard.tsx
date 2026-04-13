import { ApplicationContext } from "@/app/_layout";
import ApplicationsByCategoryChart from "@/components/applicationsByCategoryChart";
import ApplicationsOverTimeChart from "@/components/applicationsOverTimeChart";
import CompanyStatusMatrix from "@/components/statusByCompaniesMatrix";
import StatusBreakdownChart from "@/components/statusPieChart";
import { db } from "@/db/client";
import { targetsTable } from "@/db/schema";
import dayjs from 'dayjs';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from "react";
import { ScrollView, View } from 'react-native';
import { Button, Card, Menu, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Target = {
    id: number;
    period: string;
    goalCount: number;
    categoryId: number | null;

}

function getWeekRange() {
    return {
        start: dayjs().startOf('week').format('YYYY-MM-DD'),
        end: dayjs().endOf('week').format('YYYY-MM-DD'),
    }
}

function getMonthRange() {
    return {
        start: dayjs().startOf('month').format('YYYY-MM-DD'),
        end: dayjs().endOf('month').format('YYYY-MM-DD'),
    }
}

function countApplicationsInRange(
    applications: { applyDate: string; categoryId: number}[],
    start: string,
    end: string,
    categoryId: number | null
): number {
    return applications.filter(app => {
        const matchesDate = app.applyDate >= start && app.applyDate <= end;
        const matchesCategory = categoryId === null || app.categoryId === categoryId;
        
        return matchesDate && matchesCategory;
    }).length;
}




export default function dashboard() {

    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;
    const { categories, applications, statusLogs } = context;

    {/* calling the date calcualtions function for the targets */}
    const weekRange = getWeekRange();
    const monthRange = getMonthRange();

    {/* setting state values for the chart filtering */}
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // Period filter only — for Chart 1
    const periodFilteredApplications = useMemo(() => {
    if (selectedPeriod === 'all') return applications;
    const range = selectedPeriod === 'week' ? getWeekRange() : getMonthRange();
    return applications.filter(app =>
        app.applyDate >= range.start && app.applyDate <= range.end
    );
    }, [applications, selectedPeriod]);

    // Period + category filter — for Charts 2, 3, 4
    const filteredApplications = useMemo(() => {
    if (selectedCategoryId === null) return periodFilteredApplications;
    return periodFilteredApplications.filter(app => app.categoryId === selectedCategoryId);
    }, [periodFilteredApplications, selectedCategoryId]);

    const filteredStatusLogs = useMemo(() => {
        const filteredIds = new Set(filteredApplications.map(a => a.id));

        return statusLogs.filter(log => filteredIds.has(log.applicationId));
    }, [filteredApplications, statusLogs]);

    const periodLabels = {
        week: 'This week',
        month: 'This month',
        all: 'All time'
    };

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
                        {globalTargets.map(target => {
                            
                            const range = target.period === 'weekly' ? weekRange : monthRange;
                            const progress = countApplicationsInRange(applications, range.start, range.end, null);

                            return (
                                <Card key={target.id} style={{ marginBottom: 10 }}>
                                    <Card.Content>
                                        <Text variant="labelMedium">{target.period}</Text>
                                        <Text variant="titleMedium">Goal: {target.goalCount} applications</Text>
                                        <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginTop: 4 }}>All Industries</Text>

                                        <Text variant="bodyMedium" style={{ marginTop: 6 }}>
                                            Progress: {progress} / {target.goalCount}
                                        </Text>

                                        {progress >= target.goalCount && (
                                            <Text variant="bodySmall" style={{ color: 'green', marginTop: 4 }}>
                                                Target met
                                            </Text>
                                        )}
                                    </Card.Content>
                                </Card>
                        );
                    })}
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

    const theme = useTheme();


    return (
        <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: theme.colors.background }}>
            <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: theme.colors.background }}>
                <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Targets</Text>

                <Button mode="outlined" onPress={() => router.push({ pathname: '../target_add' })}>
                Add target
                </Button>

                    {content}

                <Button mode="outlined" onPress={() => router.push({ pathname: '../target_manage' })}>
                Manage Targets
                </Button>
                
                
                <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button onPress={() => setMenuVisible(true)}>
                            {periodLabels[selectedPeriod]}
                        </Button>
                    }>

                    <Menu.Item onPress={() => { setSelectedPeriod('week'); setMenuVisible(false); }} title="This week" />
                    <Menu.Item onPress={() => { setSelectedPeriod('month'); setMenuVisible(false); }} title="This month" />
                    <Menu.Item onPress={() => { setSelectedPeriod('all'); setMenuVisible(false); }} title="All time" />        

                </Menu>

                {selectedCategoryId !== null && (
                    <Button onPress={() => setSelectedCategoryId(null)}>
                        Show all insights
                    </Button>
                )}

                <ApplicationsByCategoryChart applications={periodFilteredApplications} categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId}/>

                <StatusBreakdownChart statusLogs={filteredStatusLogs}/>

                <ApplicationsOverTimeChart applications={filteredApplications}/>

                <CompanyStatusMatrix applications={filteredApplications} statusLogs={filteredStatusLogs} categories={categories} />
                
            </SafeAreaView>
        </ScrollView>
    );

}