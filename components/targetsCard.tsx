// Moved the targets card into its own component
import { Application, Category } from '@/app/_layout';
import { calculateWeeklyStreak } from '@/utils/streak';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';

type Target = {
  id: number;
  period: string;
  goalCount: number;
  categoryId: number | null;
};

type Props = {
  targets: Target[];
  applications: Application[];
  categories: Category[];
};

function getRange(period: string) {
  const unit = period === 'weekly' ? 'week' : 'month';
  return {
    start: dayjs().startOf(unit).format('YYYY-MM-DD'),
    end: dayjs().endOf(unit).format('YYYY-MM-DD'),
  };
}

function countInRange(
  applications: Application[],
  start: string,
  end: string,
  categoryId: number | null
): number {
  return applications.filter(app => {
    const inRange = app.applyDate >= start && app.applyDate <= end;
    const matchesCategory = categoryId === null || app.categoryId === categoryId;
    return inRange && matchesCategory;
  }).length;
}

export default function TargetsCard({ targets, applications, categories }: Props) {
  const router = useRouter();

  const [cardWidth, setCardWidth] = useState(0);

  if (targets.length === 0) {
    return (
      <Card style={{ marginBottom: 16 }} onLayout={(e) => setCardWidth(e.nativeEvent.layout.width - 20)} >
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>Targets</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.5, marginBottom: 12 }}>
            No targets set yet.
          </Text>
          <Button mode="outlined" onPress={() => router.push({ pathname: '../target_add' })}>
            Add target
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <Card.Content>

        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        style={{ marginHorizontal: -16 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
            
        {targets.map((target) => {
            const isGlobal = target.categoryId === null;
            const category = categories.find(c => c.id === target.categoryId);
            const label = isGlobal ? 'All Industries' : (category?.name ?? '');
            const periodLabel = target.period === 'weekly' ? 'Weekly' : 'Monthly';

            const range = getRange(target.period);
            const progress = countInRange(applications, range.start, range.end, target.categoryId);
            const met = progress >= target.goalCount;

            const streak = target.period === 'weekly'
            ? calculateWeeklyStreak(
                isGlobal ? applications : applications.filter(a => a.categoryId === target.categoryId),
                target.goalCount
                )
            : null;

            return (
            <View key={target.id} style={{ width: cardWidth }}>
                <Text variant="labelMedium" style={{ opacity: 0.6 }}>
                {periodLabel} Target · {label}
                </Text>

                <Text variant="bodyLarge" style={{ marginTop: 4 }}>
                Progress: {progress} out of {target.goalCount}
                </Text>

                {met && (
                <Text variant="bodySmall" style={{ color: 'green', marginTop: 2 }}>
                    Target met ✓
                </Text>
                )}

                {streak !== null && (
                <Text variant="bodySmall" style={{ marginTop: 2, opacity: streak > 0 ? 1 : 0.5 }}>
                    {streak > 0
                    ? `${streak} consecutive ${streak === 1 ? 'week' : 'weeks'} achieved`
                    : 'No streak yet'}
                </Text>
                )}
            </View>
            );
        })}
        </ScrollView>
        <Divider style={{ marginVertical: 12 }} />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            mode="outlined"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '../target_add' })}
          >
            Add
          </Button>
          <Button
            mode="outlined"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '../target_manage' })}
          >
            Manage
          </Button>
        </View>

      </Card.Content>
    </Card>
  );
}