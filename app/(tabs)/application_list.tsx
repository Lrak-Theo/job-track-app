import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { Chip, Divider, FAB, IconButton, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context"; // SAV is used to prevent the page content to layer on top of the IOS head bar
import JobCard from "../../components/JobCard";
import { Application, ApplicationContext, Category, ThemeContext } from "../_layout";

import { sqlite } from '@/db/client';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

import { useTheme } from "react-native-paper";

import ExportButton from "@/components/exportAsCsvButton";


export default function ListPage() {

    // Set the context and theme
    const router = useRouter();
    const context = useContext(ApplicationContext);
    const { isDarkMode } = useContext(ThemeContext);
    const theme = useTheme();
    const chipSelectedBg = isDarkMode ? '#6B4A3A' : '#E4BB97';
    const chipSelectedText = isDarkMode ? '#FFFFFF' : '#584B53';

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
                <Chip
                    onPress={clearAllFilters}
                    accessibilityLabel="Clear all filters"
                    style={{ backgroundColor: isDarkMode ? '#6B4A3A' : '#E4BB97' }}
                    textStyle={{ color: isDarkMode ? '#FFFFFF' : '#584B53', fontWeight: 'bold' }}
                >
                    Clear filters
                </Chip>
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
                        returnKeyType="search"
                        onSubmitEditing={Keyboard.dismiss}
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
                        <Chip compact onPress={clearAllFilters} accessibilityLabel="Clear all filters"
                            style={{ backgroundColor: isDarkMode ? '#6B4A3A' : '#E4BB97' }}
                            textStyle={{ fontWeight: 'bold' }}
                        >
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

                                <Chip selected={ selectedStatus === 'All'} onPress={() => setSelectedStatus('All')} accessibilityLabel="Filter by all statuses" style={{ backgroundColor: selectedStatus === 'All' ? chipSelectedBg : undefined }} textStyle={{ color: selectedStatus === 'All' ? chipSelectedText : theme.colors.onSurface }}>
                                    All
                                </Chip>

                                <Chip selected={ selectedStatus === 'Applied'} onPress={() => setSelectedStatus('Applied')} accessibilityLabel="Filter by Applied status" style={{ backgroundColor: selectedStatus === 'Applied' ? chipSelectedBg : undefined }} textStyle={{ color: selectedStatus === 'Applied' ? chipSelectedText : theme.colors.onSurface }}>
                                    Applied
                                </Chip>

                                <Chip selected={ selectedStatus === 'Interviewing'} onPress={() => setSelectedStatus('Interviewing')} accessibilityLabel="Filter by Interviewing status" style={{ backgroundColor: selectedStatus === 'Interviewing' ? chipSelectedBg : undefined }} textStyle={{ color: selectedStatus === 'Interviewing' ? chipSelectedText : theme.colors.onSurface }}>
                                    Interviewing
                                </Chip>

                                <Chip selected={ selectedStatus === 'Rejected'} onPress={() => setSelectedStatus('Rejected')} accessibilityLabel="Filter by Rejected status" style={{ backgroundColor: selectedStatus === 'Rejected' ? chipSelectedBg : undefined }} textStyle={{ color: selectedStatus === 'Rejected' ? chipSelectedText : theme.colors.onSurface }}>
                                    Rejected
                                </Chip>

                                <Chip selected={ selectedStatus === 'Offered'} onPress={() => setSelectedStatus('Offered')} accessibilityLabel="Filter by Offered status" style={{ backgroundColor: selectedStatus === 'Offered' ? chipSelectedBg : undefined }} textStyle={{ color: selectedStatus === 'Offered' ? chipSelectedText : theme.colors.onSurface }}>
                                    Offered
                                </Chip>

                                <Chip selected={ selectedStatus === 'Withdrawn'} onPress={() => setSelectedStatus('Withdrawn')} accessibilityLabel="Filter by Withdrawn status" style={{ backgroundColor: selectedStatus === 'Withdrawn' ? chipSelectedBg : undefined }} textStyle={{ color: selectedStatus === 'Withdrawn' ? chipSelectedText : theme.colors.onSurface }}>
                                    Withdrawn
                                </Chip>
                            </View>
                        </ScrollView>

                        <Divider/>

                        {/* Category Filters */}
                        <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.6 }}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: "flex-start"}}>
                            <View style ={{ flexDirection: "row", gap: 10, marginBottom: 12, marginTop: 6 }}>
                                <Chip selected={ selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} accessibilityLabel="Filter by all categories" style={{ backgroundColor: selectedCategory === 'All' ? chipSelectedBg : undefined }} textStyle={{ color: selectedCategory === 'All' ? chipSelectedText : theme.colors.onSurface }}>
                                    All Categories
                                </Chip>
                                {categories.map((category: Category) => (
                                    <Chip
                                        key={category.id}
                                        selected={selectedCategory === String(category.id)}
                                        onPress={() => setSelectedCategory(String(category.id))}
                                        accessibilityLabel={`Filter by category ${category.name}`}
                                        style={{ backgroundColor: selectedCategory === String(category.id) ? chipSelectedBg : undefined }}
                                        textStyle={{ color: selectedCategory === String(category.id) ? chipSelectedText : theme.colors.onSurface }}
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
                                <Chip selected={selectedDateRange === 'All'} onPress={() => setSelectedDateRange('All')} accessibilityLabel="Filter by all time" style={{ backgroundColor: selectedDateRange === 'All' ? chipSelectedBg : undefined }} textStyle={{ color: selectedDateRange === 'All' ? chipSelectedText : theme.colors.onSurface }}>
                                    All Time
                                </Chip>
                                <Chip selected={selectedDateRange === 'day'} onPress={() => setSelectedDateRange('day')} accessibilityLabel="Filter by today" style={{ backgroundColor: selectedDateRange === 'day' ? chipSelectedBg : undefined }} textStyle={{ color: selectedDateRange === 'day' ? chipSelectedText : theme.colors.onSurface }}>
                                    Today
                                </Chip>
                                <Chip selected={selectedDateRange === 'week'} onPress={() => setSelectedDateRange('week')} accessibilityLabel="Filter by this week" style={{ backgroundColor: selectedDateRange === 'week' ? chipSelectedBg : undefined }} textStyle={{ color: selectedDateRange === 'week' ? chipSelectedText : theme.colors.onSurface }}>
                                    This Week
                                </Chip>
                                <Chip selected={selectedDateRange === 'month'} onPress={() => setSelectedDateRange('month')} accessibilityLabel="Filter by this month" style={{ backgroundColor: selectedDateRange === 'month' ? chipSelectedBg : undefined }} textStyle={{ color: selectedDateRange === 'month' ? chipSelectedText : theme.colors.onSurface }}>
                                    This Month
                                </Chip>
                            </View>
                        </ScrollView>

                        <Divider/>
                    </>
                )}

                <ScrollView style={{ flex: 1, paddingTop: 16 }} contentContainerStyle={{ padding: 1 }} keyboardShouldPersistTaps="handled">
                        {/* listContent condition is above the render */}
                        {listContent}
                </ScrollView>

            <FAB icon="plus" style={{position: "absolute", right: 20, bottom: 20, backgroundColor: theme.colors.primary }} customColor={theme.colors.onPrimary} onPress={ () => router.push({ pathname: '../add'})} accessibilityLabel="Add new application"/>
            {/* FAB is Floating Add Button, useful for screen scrolling while adding a row */}
            </View>
        </SafeAreaView>
    );
}
