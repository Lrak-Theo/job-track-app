import { applicationsTable, categoriesTable } from '@/db/schema';
import { useMemo } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';

{/* $InferSelect is from Drizzle ORM and extracts the TypeScript type that a row from that table would have */}
type Application = typeof applicationsTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;

type Props = {
    applications: Application[];
    categories: Category[];
    selectedCategoryId: number | null;
    onSelectCategory: (id: number | null) => void;
};

export default function ApplicationsByCategoryChart({ applications, categories, selectedCategoryId, onSelectCategory}: Props) { 

    const theme = useTheme(); 

    {/* useMemo caches the result of the calculation and only re-runs it again when its dependencies change (when a new application is added) */}
    const chartData = useMemo(() => {

        const counts: Record<number, number> = {}; {/* { [key: number]: number } is the same as Record*/}

        applications.forEach(app => {
            counts[app.categoryId] = (counts[app.categoryId] ?? 0) + 1;
        });

        {/* The individual bar getting created */}
        return categories.map(category => ({

            label: category.name,
            value: counts[category.id] ?? 0,
            frontColor: selectedCategoryId === null || selectedCategoryId === category.id
            ? category.color
            : category.color + '40',

        })).filter(d => d.value > 0);
    }, [applications, categories, selectedCategoryId]);



    let content;

    if (chartData.length === 0) {
        content = (
            <Text>No applications to display yet!</Text>
        );
    } else {
        {/* Content when there are applications, the populated bar chart will be ready to be rendered */}
        content =(
            <BarChart data={chartData} barWidth={32} spacing={16} roundedTop hideRules
                xAxisLabelTextStyle={{ fontSize: 11, color: theme.colors.onSurface }}
                yAxisTextStyle={{ color: theme.colors.onSurface }}
                xAxisColor={theme.colors.onSurface}
                yAxisColor={theme.colors.onSurface}
                noOfSections={4} maxValue={Math.max(...chartData.map(d => d.value )) + 1} 
                onPress={(item: any) => {
                    const cat = categories.find(c => c.name === item.label);
                    if (!cat) return;
                    onSelectCategory(selectedCategoryId === cat.id ? null : cat.id);
                }}
                isAnimated animationDuration={500}
                />
        )
    };

    return (
        <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 12 }}>
            {content}
        </View>
    )
}   
