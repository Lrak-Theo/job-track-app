import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export function calculateWeeklyStreak(
  applications: { applyDate: string }[],
  weeklyGoal: number
): number {
  if (weeklyGoal <= 0) return 0;

  // Group application counts by week start date
  const weekCounts: Record<string, number> = {};
  
  for (const app of applications) {
    const weekKey = dayjs(app.applyDate).startOf('isoWeek').format('YYYY-MM-DD');
    weekCounts[weekKey] = (weekCounts[weekKey] ?? 0) + 1;
  }

  let streak = 0;
  // Start from last week, walk backwards
  let determinant = dayjs().subtract(1, 'week').startOf('isoWeek');

  while (true) {
    const key = determinant.format('YYYY-MM-DD');
    const count = weekCounts[key] ?? 0;
    if (count >= weeklyGoal) {
      streak++;
      determinant = determinant.subtract(1, 'week');
    } else {
      break;
    }
  }

  return streak;
}