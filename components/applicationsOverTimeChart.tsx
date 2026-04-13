import { applicationsTable } from '@/db/schema';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useMemo } from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';

type Application = typeof applicationsTable.$inferSelect;

type Props = {
    applications: Application[];
};

dayjs.extend(weekOfYear);

function getWeekKey(dateStr: string): string {
    const d = dayjs(dateStr);
    return `${d.year()}-W${String(d.week()).padStart(2, '0')}`;
}

function getLast12Weeks(): string[] {
    const weeks: string[] = [];

    for (let i = 11; i >= 0; i--) {
        const d = dayjs().subtract(i, 'week');
        weeks.push(`${d.year()}-W${String(d.week()).padStart(2, '0')}`);
    }
    return weeks;
}

const monthly_background_colours = ['#1D9E75', '#0F6E56'];

export default function ApplicationsOverTimeChart({ applications }: Props ) { 
    
    const theme = useTheme();

    const chartData = useMemo(() => {
        const weeks = getLast12Weeks();
        const counts: Record<string, number> = {};

        applications.forEach(app => {
            const key = getWeekKey(app.applyDate);
            counts[key] = (counts[key] ?? 0) + 1; 
        });

        return weeks.map((week, index) => {
            const bandIndex = Math.floor(index / 4) % 2;

            return {
                value: counts[week] ?? 0,
                label: `W${index + 1}`,
                dataPointColor: monthly_background_colours[bandIndex],
                dataPointRadius: 4,
                showStrip: false,
            };
        });
    }, [applications]);

    let content;

    if (chartData.every(d => d.value === 0)) {
        content = <Text>No applications in the last 12 weeks</Text>;
    } else {
        content = (
            <LineChart data={chartData} height={180} spacing={44} hideRules color="#1D9E75" thickness={2}
                        xAxisLabelTextStyle={{ fontSize: 10, color: theme.colors.onSurface }}
                        yAxisTextStyle={{ fontSize: 10, color: theme.colors.onSurface }}
                        xAxisColor={theme.colors.onSurface}
                        yAxisColor={theme.colors.onSurface}
                        noOfSections={4} maxValue={Math.max(...chartData.map(d => d.value)) + 1} hideDataPoints={false} 
                        isAnimated animationDuration={500}/>
        );
    }

    return (
        <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 12 }}>
            <Text>Applications over time</Text>
            {content}
        </View>
    )
}