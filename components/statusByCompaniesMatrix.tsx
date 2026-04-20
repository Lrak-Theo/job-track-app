import { applicationsTable, applicationStatusLogsTable, categoriesTable } from '@/db/schema';
import { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Application = typeof applicationsTable.$inferSelect;
type StatusLog = typeof applicationStatusLogsTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;

type Props = {
  applications: Application[];
  statusLogs: StatusLog[];
  categories: Category[];
};

const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'];

const STATUS_COLOURS: Record<string, string> = {
  Applied: '#378ADD',
  Interviewing: '#EF9F27',
  Offered: '#1D9E75',
  Rejected: '#E24B4A',
  Withdrawn: '#888780',
};

function getOpacity(count: number, max: number): string {
  if (count === 0) return '0';
  const opacity = Math.round((0.2 + (count / max) * 0.8) * 10) / 10;
  return String(opacity);
}

export default function CompanyStatusMatrix({ applications, statusLogs, categories }: Props) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const { rows, maxCount } = useMemo(() => {
    const companyMap: Record<string, Record<string, number>> = {};

    applications.forEach(app => {
      if (!companyMap[app.jobCompany]) {
        companyMap[app.jobCompany] = {};
        STATUSES.forEach(s => companyMap[app.jobCompany][s] = 0);
      }
    });

    statusLogs.forEach(log => {
      const app = applications.find(a => a.id === log.applicationId);
      if (!app) return;
      if (!companyMap[app.jobCompany]) return;
      companyMap[app.jobCompany][log.status] = (companyMap[app.jobCompany][log.status] ?? 0) + 1;
    });

    const sorted = Object.entries(companyMap)
      .map(([company, statuses]) => ({
        company,
        statuses,
        total: Object.values(statuses).reduce((s, v) => s + v, 0),
      }))
      .sort((a, b) => b.total - a.total);

    let maxCount = 1;
    sorted.forEach(row => {
      Object.values(row.statuses).forEach(v => {
        if (v > maxCount) maxCount = v;
      });
    });

    return { rows: sorted, maxCount };
  }, [applications, statusLogs]);

  const visibleRows = expanded ? rows : rows.slice(0, 5);

  let content;

  if (rows.length === 0) {
    content = <Text>No applications yet.</Text>;
  } else {
    content = (
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              <View style={{ width: 110 }} />
              {STATUSES.map(s => (
                <View key={s} style={{ width: 72, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: theme.colors.onSurface }}>{s}</Text> 
                </View>
              ))}
            </View>

            {visibleRows.map(row => (
              <View key={row.company} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ width: 110 }}>
                  <Text style={{ fontSize: 11, color: theme.colors.onSurface }} numberOfLines={1}>{row.company}</Text> 
                </View>
                {STATUSES.map(status => {
                  const count = row.statuses[status] ?? 0;
                  const baseColor = STATUS_COLOURS[status];
                  const opacity = getOpacity(count, maxCount);
                  return (
                    <View
                      key={status}
                      style={{ width: 72, height: 32, borderRadius: 6, marginHorizontal: 2,
                        backgroundColor: count === 0 ? theme.colors.surfaceVariant : baseColor, opacity: count === 0 ? 1 : Number(opacity),
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '500', color: count === 0 ? theme.colors.onSurface : '#fff' }}>
                        {count === 0 ? '—' : count}
                      </Text>
                      
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {rows.length > 5 && (
          <TouchableOpacity
            onPress={() => setExpanded(prev => !prev)}
            style={{ marginTop: 12, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, color: theme.colors.primary }}> 
              {expanded ? 'Show less' : `Show all ${rows.length} companies`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
     <View style={{ marginTop: 24, backgroundColor: theme.colors.surface, padding: 12, borderRadius: 12 }}>
      {content}
    </View>
  );
}