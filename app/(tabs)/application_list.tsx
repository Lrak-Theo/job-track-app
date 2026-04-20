import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { ScrollView, View } from "react-native";
import { Chip, Divider, FAB, IconButton, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context"; // SAV is used to prevent the page content to layer on top of the IOS head bar
import JobCard from "../../components/JobCard";
import { Application, ApplicationContext, Category } from "../_layout";

import { sqlite } from '@/db/client';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

import { useTheme } from "react-native-paper";

import ExportButton from "@/components/exportAsCsvButton";


export default function ListPage() {

    // Set the context and theme
    const router = useRouter();
    const context = useContext(ApplicationContext);
    const theme = useTheme(); // Moved above conditional return to satisfy Rules of Hooks

    // ORM... 
    useDrizzleStudio(sqlite);

    // Set state values
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDateRange, setSelectedDateRange] = useState('All');
    const [filtersVisible, setFiltersVisible] = useState(false);


    // Early error handling
    if (!context) return null;


    // Derived Data logic
    const { applications, categories } = context;
    const normalisedQuery = searchQuery.trim().toLowerCase();
    const filtersActive = selectedStatus !== 'All' || selectedCategory !== 'All' || selectedDateRange !== 'All' || normalisedQuery.length > 0;

    const filteredApplications = applications.filter((application) => {

        const now = new Date();
        const appDate = new Date(application.applyDate);

        const matchesSearch =
            normalisedQuery.length === 0 || application.jobCompany.toLowerCase().includes(normalisedQuery) ||
            application.jobTitle.toLowerCase().includes(normalisedQuery);

        const matchesStatus =
            selectedStatus === 'All' || application.status === selectedStatus;

        const matchesCategory =
            selectedCategory === 'All' || application.categoryId === Number(selectedCategory);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        startOfWeek.setHours(0, 0, 0, 0);

        const today = now.toISOString().split('T')[0];

        const matchesDateRange =
                selectedDateRange === 'All' ||
                (selectedDateRange === 'day' && application.applyDate === today) ||
                (selectedDateRange === 'week' && appDate >= startOfWeek) ||
                (selectedDateRange === 'month' && appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear());

        return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
    });

    // Handler...
    const clearAllFilters = () => {
        setSelectedStatus('All');
        setSelectedCategory('All');
        setSelectedDateRange('All');
        setSearchQuery('');
    };


    // Converting the conditional block for the application filter into a elif for personal preference
    let listContent;

    if (filteredApplications.length === 0 && applications.length === 0) {
        // No applications exist at all — prompt the user to add one
        listContent = (
            <View style={{ alignItems: 'center', marginTop: 40, gap: 12 }}>
                <Text variant="titleMedium" style={{ textAlign: 'center' }}>No applications yet</Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.6 }}>Tap + to add your first application</Text>
            </View>
        );
    } else if (filteredApplications.length === 0) {
        // Applications exist but nothing matches the active filters
        listContent = (
            <View style={{ alignItems: 'center', marginTop: 40, gap: 12 }}>
                <Text variant="titleMedium" style={{ textAlign: 'center' }}>No matches found</Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.6 }}>Try adjusting your filters or search term</Text>
                <Chip onPress={clearAllFilters} accessibilityLabel="Clear all filters">Clear filters</Chip>
            </View>
        );
    } else {
        listContent = filteredApplications.map((application: Application) => {
            const category = categories.find(c => c.id === application.categoryId);
            return (
                <JobCard
                    key={application.id}
                    application={application}
                    category={category!}
                    onPress={() => router.push({
                        pathname: '../application/[id]',
                        params: { id: String(application.id) }
                    })}
                />
            );
        });
    }
    // End Block


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1, padding: 20 }}>

                {/* This is the heading design */}
                <Text variant="headlineMedium" style={{ marginBottom: 20, fontFamily: 'Times New Roman', fontWeight: 'bold' }}>Applications</Text>

                {/* Search bar is the primary Find action — placed above filters */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <TextInput
                        label="Search"
                        placeholder="Search by company or role"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ flex: 1, marginRight: 4, backgroundColor: theme.colors.surface }}
                        dense
                        accessibilityLabel="Search applications by company or role"
                    />
                    <ExportButton />
                    <IconButton
                        icon="filter-variant"
                        selected={filtersVisible || filtersActive}
                        onPress={() => setFiltersVisible(!filtersVisible)}
                        accessibilityLabel={filtersVisible ? "Hide filters" : "Show filters"}
                    />
                </View>

                {/* Result count + clear all shortcut when filters are active */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                        Showing {filteredApplications.length} of {applications.length}
                    </Text>
                    {filtersActive && (
                        <Chip compact onPress={clearAllFilters} accessibilityLabel="Clear all filters">
                            Clear all
                        </Chip>
                    )}
                </View>

                {filtersVisible && (
                    <>
                        <Divider/>

                        {/* Filter Buttons */}
                        <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.6 }}>Status</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: "flex-start", backgroundColor: theme.colors.background }}>
                        {/* ScrollView (line above) enables the user to swipe across the filters */}
                            <View style ={{ flexDirection: "row", gap: 10, marginBottom: 12, marginTop: 6 }}>

                                <Chip selected={ selectedStatus === 'All'} onPress={() => setSelectedStatus('All')} accessibilityLabel="Filter by all statuses" style={{ backgroundColor: selectedStatus === 'All' ? theme.colors.secondary : undefined }}>
                                    All
                                </Chip>

                                <Chip selected={ selectedStatus === 'Applied'} onPress={() => setSelectedStatus('Applied')} accessibilityLabel="Filter by Applied status" style={{ backgroundColor: selectedStatus === 'Applied' ? theme.colors.secondary : undefined }}>
                                    Applied
                                </Chip>

                                <Chip selected={ selectedStatus === 'Interviewed'} onPress={() => setSelectedStatus('Interviewed')} accessibilityLabel="Filter by Interviewed status" style={{ backgroundColor: selectedStatus === 'Interviewed' ? theme.colors.secondary : undefined }}>
                                    Interviewed
                                </Chip>

                                <Chip selected={ selectedStatus === 'Rejected'} onPress={() => setSelectedStatus('Rejected')} accessibilityLabel="Filter by Rejected status" style={{ backgroundColor: selectedStatus === 'Rejected' ? theme.colors.secondary : undefined }}>
                                    Rejected
                                </Chip>

                                <Chip selected={ selectedStatus === 'No Response'} onPress={() => setSelectedStatus('No Response')} accessibilityLabel="Filter by No Response status" style={{ backgroundColor: selectedStatus === 'No Response' ? theme.colors.secondary : undefined }}>
                                    No Response
                                </Chip>
                            </View>
                        </ScrollView>

                        <Divider/>

                        {/* Category Filters */}
                        <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.6 }}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: "flex-start"}}>
                            <View style ={{ flexDirection: "row", gap: 10, marginBottom: 12, marginTop: 6 }}>
                                <Chip selected={ selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} accessibilityLabel="Filter by all categories" style={{ backgroundColor: selectedCategory === 'All' ? theme.colors.secondary : undefined }}>
                                    All Categories
                                </Chip>
                                {categories.map((category: Category) => (
                                    <Chip
                                        key={category.id}
                                        selected={selectedCategory === String(category.id)}
                                        onPress={() => setSelectedCategory(String(category.id))}
                                        accessibilityLabel={`Filter by category ${category.name}`}
                                        style={{ backgroundColor: selectedCategory === String(category.id) ? theme.colors.secondary : undefined }}
                                    >
                                        {category.name}
                                    </Chip>
                                ))}
                            </View>
                        </ScrollView>

                        <Divider/>

                        {/* Date Filters */}
                        <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.6 }}>Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: "flex-start"}}>
                            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12, marginTop: 6 }}>
                                <Chip selected={selectedDateRange === 'All'} onPress={() => setSelectedDateRange('All')} accessibilityLabel="Filter by all time" style={{ backgroundColor: selectedDateRange === 'All' ? theme.colors.secondary : undefined }}>
                                    All Time
                                </Chip>
                                <Chip selected={selectedDateRange === 'day'} onPress={() => setSelectedDateRange('day')} accessibilityLabel="Filter by today" style={{ backgroundColor: selectedDateRange === 'day' ? theme.colors.secondary : undefined }}>
                                    Today
                                </Chip>
                                <Chip selected={selectedDateRange === 'week'} onPress={() => setSelectedDateRange('week')} accessibilityLabel="Filter by this week" style={{ backgroundColor: selectedDateRange === 'week' ? theme.colors.secondary : undefined }}>
                                    This Week
                                </Chip>
                                <Chip selected={selectedDateRange === 'month'} onPress={() => setSelectedDateRange('month')} accessibilityLabel="Filter by this month" style={{ backgroundColor: selectedDateRange === 'month' ? theme.colors.secondary : undefined }}>
                                    This Month
                                </Chip>
                            </View>
                        </ScrollView>

                        <Divider/>
                    </>
                )}

                <ScrollView style={{ flex: 1, paddingTop: 16 }} contentContainerStyle={{ padding: 1 }}>
                        {/* listContent condition is above the render */}
                        {listContent}
                </ScrollView>

            <FAB icon="plus" style={{position: "absolute", right: 20, bottom: 20, backgroundColor: theme.colors.primary }} customColor={theme.colors.onPrimary} onPress={ () => router.push({ pathname: '../add'})} accessibilityLabel="Add new application"/>
            {/* FAB is Floating Add Button, useful for screen scrolling while adding a row */}
            </View>
        </SafeAreaView>
    );
}
