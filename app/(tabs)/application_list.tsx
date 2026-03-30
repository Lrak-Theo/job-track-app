import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { ScrollView, View } from "react-native";
import { Chip, Divider, FAB, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context"; // SAF is used to prevent the page content to layer on top of the IOS head bar
import JobCard from "../../components/JobCard";
import { Application, ApplicationContext, Category } from "../_layout";


export default function ListPage() {

    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;

    const { applications, categories } = context;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDateRange, setSelectedDateRange] = useState('All');

    const normalisedQuery = searchQuery.trim().toLowerCase();

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

        const matchesDateRange =
                selectedDateRange === 'All' ||
                (selectedDateRange === '7' && appDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
                (selectedDateRange === '30' && appDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) ||
                (selectedDateRange === 'month' && appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear());

        return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
    });
    
    
    {/* Converting the conditional block for the application filter into a elif for personal preference */}
    let listContent;

    if (filteredApplications.length === 0) {
        listContent = (
            <Text style={{ textAlign: 'center', marginTop: 20, opacity: 0.6 }}>
                No applications found
            </Text>
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


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 20 }}>

                {/* This is the heading desing */}
                <Text variant="headlineMedium">Applications</Text> 
                {/* Whitespace in one line can affect indent of text */}
                

                <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
                    Look at your applications status
                </Text>

                {/* Filter Buttons */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: "flex-start"}}>
                {/* ScrollView (line above) enables the user to swipe across the filters */}
                    <View style ={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>

                        <Chip selected={ selectedStatus === 'All'} onPress={() => setSelectedStatus('All')}> 
                            All 
                        </Chip>

                        <Chip selected={ selectedStatus === 'Applied'} onPress={() => setSelectedStatus('Applied')}> 
                            Applied 
                        </Chip>

                        <Chip selected={ selectedStatus === 'Interviewed'} onPress={() => setSelectedStatus('Interviewed')}> 
                            Interviewed 
                        </Chip>

                        <Chip selected={ selectedStatus === 'Rejected'} onPress={() => setSelectedStatus('Rejected')}> 
                            Rejected 
                        </Chip>

                        <Chip selected={ selectedStatus === 'No Response'} onPress={() => setSelectedStatus('No Response')}> 
                            No Response 
                        </Chip>
                    </View>
                </ScrollView>
                
                <Divider/>

                {/* Category Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: "flex-start"}}>
                    <View style ={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                        <Chip selected={ selectedCategory === 'All'} onPress={() => setSelectedCategory('All')}> 
                            All Categories
                        </Chip>
                        {categories.map((category: Category) => (
                            <Chip 
                                key={category.id}
                                selected={selectedCategory === String(category.id)} 
                                onPress={() => setSelectedCategory(String(category.id))}
                            > 
                                {category.name}
                            </Chip>
                        ))}
                    </View>
                </ScrollView>
                
                <Divider/>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: "flex-start"}}>
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                        <Chip selected={selectedDateRange === 'All'} onPress={() => setSelectedDateRange('All')}>
                            All Time
                        </Chip>
                        <Chip selected={selectedDateRange === '7'} onPress={() => setSelectedDateRange('7')}>
                            Last 7 Days
                        </Chip>
                        <Chip selected={selectedDateRange === '30'} onPress={() => setSelectedDateRange('30')}>
                            Last 30 Days
                        </Chip>
                        <Chip selected={selectedDateRange === 'month'} onPress={() => setSelectedDateRange('month')}>
                            This Month
                        </Chip>
                    </View>
                </ScrollView>

                <Divider/>

                <TextInput placeholder="Search by comapny or role" value={searchQuery} onChangeText={setSearchQuery} style={{ borderWidth: 1, marginBottom: 10, padding: 8}}/>

                <ScrollView style={{ flex: 1, paddingTop: 16 }} contentContainerStyle={{ padding: 1 }}>
                        {/* listContent condition is above the render */}
                        {listContent} 
                </ScrollView>

            <FAB icon="plus" style={{position: "absolute", right: 20, bottom: 20 }} onPress={ () => router.push({ pathname: '../add'})}/>
            {/* FAB is Floating Add Button, useful for screen scrolling while adding a row */}
            </View>
        </SafeAreaView>
    );
}
