import { applicationsTable } from '@/db/schema';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';


type Application = typeof applicationsTable.$inferSelect;

type Props = {
    applications: Application[];
};

type SalaryDataPoint = {
    title: string;
    salary: number;
};


export default function MarketSalaryComparisonChart({ applications }: Props) {

    const theme = useTheme();
    const [data, setData] = useState<SalaryDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const topJobTitles = useMemo(() => {

        const titleCounts = applications.reduce<Record<string, number>>((acc, app) => {
            if (!app.jobTitle?.trim()) return acc;
            const normalised = app.jobTitle.trim().toLowerCase();
            acc[normalised] = (acc[normalised] ?? 0) + 1;
            return acc;
        }, {});

        return Object.entries(titleCounts)
        // Filtering and sorting the titles by top 4 most frequent 
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([normalisedTitle]) => 
            
            applications.find(a => a.jobTitle?.trim().toLowerCase() === normalisedTitle)!.jobTitle!.trim()
        );

    }, [applications]);


    useEffect(() => {
        if (topJobTitles.length === 0) return;
 
        const fetchSalaries = async () => {
            setLoading(true);
            setError(false);

            try {
                const results = await Promise.allSettled(
                    topJobTitles.map(async (title) => {
                        const res = await fetch(
                            `https://api.adzuna.com/v1/api/jobs/gb/jobsworth` +
                            `?app_id=${process.env.EXPO_PUBLIC_ADZUNA_APP_ID}` +
                            `&app_key=${process.env.EXPO_PUBLIC_ADZUNA_APP_KEY}` +
                            `&title=${encodeURIComponent(title)}`
                        );

                        const json = await res.json();
                        if (!json.salary) return null;

                        return { title, salary: json.salary } as SalaryDataPoint;
                    })
                );

                const points = results
                    .filter(r => r.status === 'fulfilled' && r.value !== null)
                    .map(r => (r as PromiseFulfilledResult<SalaryDataPoint>).value)
                    .sort((a, b) => b.salary - a.salary);

                setData(points);
                if (points.length === 0) setError(true); 
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSalaries();
    }, [topJobTitles]);

    const chartData = useMemo(() =>
        data.map(point => ({
            value: Math.round(point.salary / 100) * 100,
            label: point.title,
            frontColor: theme.colors.primary,
        })),
    [data, theme]);


    // Visualisiing the API chart
    let content;

    if (loading) {
        content = (
            <Text variant="bodyMedium" style={{ opacity: 0.5, marginTop: 8 }}>
                Fetching market data...
            </Text>
        );
    } else if (error) {
        content = (
            <Text variant="bodyMedium" style={{ opacity: 0.5, marginTop: 8 }}>
                Could not load salary data. Check your connection and try again.
            </Text>
        );
    } else if (chartData.length === 0) {
        content = (
            <Text variant="bodyMedium" style={{ opacity: 0.5, marginTop: 8 }}>
                Add applications with job titles to see market rates.
            </Text>
        );
    } else {
        content = (
                <BarChart
                    data={chartData}
                    barWidth={50}
                    spacing={16}
                    roundedTop
                    hideRules
                    xAxisLabelsVerticalShift={2}
                    xAxisLabelTextStyle={{ fontSize: 10, color: theme.colors.onSurface }}
                    yAxisTextStyle={{ fontSize: 10, color: theme.colors.onSurface }}
                    xAxisColor={theme.colors.onSurface}
                    yAxisColor={theme.colors.onSurface}
                    isAnimated
                    animationDuration={500}
                    noOfSections={10}
                    maxValue={50000}
                />
            );
    }
 
    return (
        <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 12, marginTop: 16, paddingTop: 24 }}>
            <Text variant="titleSmall">Market salary comparison</Text>
            <Text variant="bodySmall" style={{ opacity: 0.6, marginBottom: 8 }}>
                Estimated Irish market rate (UK adjusted GBP/EUR) · Most appeared job titles in your applications · via Adzuna
            </Text>
            {content}
        </View>
    );
}