import { applicationStatusLogsTable } from '@/db/schema';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type StatusLog = typeof applicationStatusLogsTable.$inferSelect;

type Props = {
    statusLogs: StatusLog[];
};

const statusColours: Record<string, string> = {
  Applied: '#378ADD',
  Interviewing: '#EF9F27',
  Offered: '#1D9E75',
  Rejected: '#E24B4A',
  Withdrawn: '#888780',
};

export default function StatusBreakdownChart( { statusLogs }: Props) {
    const chartData = useMemo(() => {
        const counts: Record<string, number> = {};

        statusLogs.forEach(log => {
            counts[log.status] = (counts[log.status] ?? 0) + 1;
        });

        return Object.entries(counts).map(([status, value]) => ({
            value, color: statusColours[status] ?? '#888780', text: status
        })).filter(d => d.value > 0 );
    }, [statusLogs]);

    let content;

    if (chartData.length === 0) {
        content = <Text>No status data yet</Text>;
    } else {
        content = (
            <View>
                <PieChart data={chartData} donut radius={90} innerRadius={55} 
                centerLabelComponent={() => (
                    <Text>{statusLogs.length} total</Text>
                )}/>
            
            <View>
                {chartData.map(item => (
                    <View key={item.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.color }} />
                    <Text>{item.text} · {item.value}</Text>
                    </View>
                ))}
            </View>

            
            </View>
        );
    }

    return (
        <View>
            <Text>Status breakdown</Text>
            {content}
        </View>
    );
}