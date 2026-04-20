import { ApplicationContext, AuthContext } from "@/app/_layout";
import ApplicationsByCategoryChart from "@/components/applicationsByCategoryChart";
import MarketSalaryComparisonChart from "@/components/salaryComparisonChart";
import CompanyStatusMatrix from "@/components/statusByCompaniesMatrix";
import StatusBreakdownChart from "@/components/statusPieChart";
import TargetsCard from "@/components/targetsCard";
import { db } from "@/db/client";
import { targetsTable } from "@/db/schema";
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from "react";
import { ScrollView, View } from 'react-native';
import { Button, Chip, Divider, Menu, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Target = {
    id: number;
    period: string;
    goalCount: number;
    categoryId: number | null;

}

function getDayRange() {
    const today = dayjs().format('YYYY-MM-DD');
    return { start: today, end: today };
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


export default function dashboard() {

    // Load the context and theme
    const context = useContext(ApplicationContext);
    const authContext = useContext(AuthContext);
    const theme = useTheme(); // Moved above conditional return to satisfy Rules of Hooks

    
    {/* setting state values for the chart filtering */}
    const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [targets, setTargets] = useState<Target[]>([]);

    {/* Filtered Data Logic */}
    // Period filter only — for Chart 1
    const periodFilteredApplications = useMemo(() => {
        if (!context) return [];
        if (selectedPeriod === 'all') return context.applications;
        const range = selectedPeriod === 'day' ? getDayRange() : selectedPeriod === 'week' ? getWeekRange() : getMonthRange();
        return context.applications.filter(app =>
            app.applyDate >= range.start && app.applyDate <= range.end
        );
    }, [context, selectedPeriod]);

    // Period + category filter — for Charts 2, 3, 4
    const filteredApplications = useMemo(() => {
        if (selectedCategoryId === null) return periodFilteredApplications;
        return periodFilteredApplications.filter(app => app.categoryId === selectedCategoryId);
    }, [periodFilteredApplications, selectedCategoryId]);

    const filteredStatusLogs = useMemo(() => {
        if (!context) return [];
        const filteredIds = new Set(filteredApplications.map(a => a.id));
        return context.statusLogs.filter(log => filteredIds.has(log.applicationId));
    }, [context, filteredApplications]);


    // Effects...
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const userId = authContext?.currentUser?.id;
                if (!userId) return;
                const rows = await db.select().from(targetsTable).where(eq(targetsTable.userId, userId));
                setTargets(rows);
            };
            load();
        }, [])
    );

    // Early error handling 
    if (!context) return null;

    
    // Derived constants (after null check)
    const { categories, applications, statusLogs } = context;

    const periodLabels = {
        day: 'Today',
        week: 'This week',
        month: 'This month',
        all: 'All time'
    };

    const activeCategoryName = selectedCategoryId !== null
        ? categories.find(c => c.id === selectedCategoryId)?.name ?? 'Unknown'
        : null;



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: theme.colors.background }}>

                {/* Page heading */}
                <Text variant="headlineMedium" style={{ marginBottom: 20, fontFamily: 'Times New Roman', fontWeight: 'bold' }}>Dashboard</Text>

                <TargetsCard targets={targets} applications={applications} categories={categories} />

                <Divider style={{ marginVertical: 16 }}/>

                {/* Period filter with label */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text variant="labelSmall" style={{ opacity: 0.6, marginRight: 8 }}>Period</Text>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <Button
                                onPress={() => setMenuVisible(true)}
                                accessibilityLabel={`Change period, currently ${periodLabels[selectedPeriod]}`}
                            >
                                {periodLabels[selectedPeriod]}
                            </Button>
                        }>

                        <Menu.Item onPress={() => { setSelectedPeriod('day'); setMenuVisible(false); }} title="Today" />
                        <Menu.Item onPress={() => { setSelectedPeriod('week'); setMenuVisible(false); }} title="This week" />
                        <Menu.Item onPress={() => { setSelectedPeriod('month'); setMenuVisible(false); }} title="This month" />
                        <Menu.Item onPress={() => { setSelectedPeriod('all'); setMenuVisible(false); }} title="All time" />

                    </Menu>

                    {/* Show active category filter with name so user knows what's filtered */}
                    {activeCategoryName !== null && (
                        <Chip
                            compact
                            onClose={() => setSelectedCategoryId(null)}
                            onPress={() => setSelectedCategoryId(null)}
                            accessibilityLabel={`Filtered by category ${activeCategoryName}, press to clear`}
                            style={{ marginLeft: 8 }}
                        >
                            {activeCategoryName}
                        </Chip>
                    )}
                </View>

                <Divider style={{ marginBottom: 16 }}/>

                {/* Chart sections with labels */}
                <Text variant="titleSmall" style={{ marginBottom: 8, textAlign: 'center' }}>Applications by Category</Text>
                <ApplicationsByCategoryChart applications={periodFilteredApplications} categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId}/>

                <Divider style={{ marginVertical: 16 }}/>

                <Text variant="titleSmall" style={{ marginBottom: 8, textAlign: 'center' }}>Status Breakdown</Text>
                <StatusBreakdownChart statusLogs={filteredStatusLogs}/>

                <Divider style={{ marginVertical: 16 }}/>

                <Text variant="titleSmall" style={{ marginBottom: 8, textAlign: 'center' }}>Company Status Matrix</Text>
                <CompanyStatusMatrix applications={filteredApplications} statusLogs={filteredStatusLogs} categories={categories} />

                <View style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 12, padding: 16, marginTop: 16 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 8, textAlign: 'center' }}>Market Salary Comparison</Text>
                    <MarketSalaryComparisonChart applications={applications}/>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
