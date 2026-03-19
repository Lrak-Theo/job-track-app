import { useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, View } from "react-native";
import { Chip, Divider, FAB, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context"; // SAF is used to prevent the page content to layer on top of the IOS head bar
import JobCard from "../../components/JobCard";
import { Application, ApplicationContext } from "../_layout";



export default function ListPage() {

    const router = useRouter();
    const context = useContext(ApplicationContext);

    if (!context) return null;

    const { applications } = context;


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
                        <Chip selected> All </Chip>
                        <Chip> Applied </Chip>
                        <Chip> Interviewed </Chip>
                        <Chip> Rejected </Chip>
                        <Chip> No Response </Chip>
                    </View>
                </ScrollView>

                <Divider/>

                <ScrollView style={{ flex: 1, paddingTop: 16 }}>
                    {applications.map((application: Application) => (
                        <JobCard
                            key={application.id}
                            application={application}
                            onPress={() => router.push({
                                pathname: '../application/[id]',
                                params: { id: application.id}
                            })}
                        />
                    ))}
                </ScrollView>

            <FAB icon="plus" style={{position: "absolute", right: 20, bottom: 20 }} onPress={ () => router.push({ pathname: '../add'})}/>
            {/* FAB is Floating Add Button, useful for screen scrolling while adding a row */}

            </View>
        </SafeAreaView>
    );
}
