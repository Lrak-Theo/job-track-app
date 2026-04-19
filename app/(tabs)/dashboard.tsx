import { ApplicationContext } from "@/app/_layout";
import ApplicationsByCategoryChart from "@/components/applicationsByCategoryChart";
import MarketSalaryComparisonChart from "@/components/salaryComparisonChart";
import CompanyStatusMatrix from "@/components/statusByCompaniesMatrix";
import StatusBreakdownChart from "@/components/statusPieChart";
import TargetsCard from "@/components/targetsCard";
import { db } from "@/db/client";
import { targetsTable } from "@/db/schema";
import dayjs from 'dayjs';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from "react";
import { ScrollView } from 'react-native';
import { Button, Menu, useTheme } from "react-native-paper";
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


export default function dashboard() {

    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;
    const { categories, applications, statusLogs } = context;


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


    const theme = useTheme();


    return (
        <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: theme.colors.background }}>
            <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: theme.colors.background }}>

                <TargetsCard targets={targets} applications={applications} categories={categories} />
                
                
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

                <CompanyStatusMatrix applications={filteredApplications} statusLogs={filteredStatusLogs} categories={categories} />
                
                <MarketSalaryComparisonChart applications={applications}/>
                
            </SafeAreaView>
        </ScrollView>
    );
}