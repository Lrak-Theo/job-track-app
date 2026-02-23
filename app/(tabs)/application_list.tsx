import { ScrollView, View } from "react-native";
import { Card, Chip, Divider, FAB, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context"; // SAF is used to prevent the page content to layer on top of the IOS head bar

export default function list_page() {

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 20 }}>

                {/* This is the heading desing */}
                <Text variant="headlineMedium">Applications</Text> 
                {/* Whitespace in one line can affect indent of text */}
                

                <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
                    Look at your application statuses
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

                <View style={{ flex: 1, paddingTop: 16 }}>
                    {/* Example of applications (what they would look like before CRUD) */}
                    <Card style={{ marginBottom: 15 }}>
                        <Card.Content>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                {/* Becareful of trailing spaces in style={{" "}} as it can prevent the format from happening*/}
                                <Text variant="titleMedium">RedHat</Text>
                                <Chip mode="flat" textStyle={{ fontSize: 12 }}>
                                    Applied
                                </Chip>
                            </View>

                            <Text variant="bodyMedium" style={{ marginTop: 3 }}>
                                Software Developer
                            </Text>

                            <Text variant="bodySmall" style= {{ marginTop: 6, opacity: 0.6 }}>
                                Applied: 20 Feb 2026
                            </Text>
                        </Card.Content>
                    </Card>

                    <Card style={{ marginBottom: 15 }}>
                        <Card.Content>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                <Text variant="titleMedium">Bank of Ireland</Text>
                                <Chip mode="flat" textStyle={{ fontSize: 12 }}>
                                    Rejected
                                </Chip>
                            </View>

                            <Text variant="bodyMedium" style={{ marginTop: 3 }}>
                                Accountant
                            </Text>

                            <Text variant="bodySmall" style= {{ marginTop: 6, opacity: 0.6 }}>
                                Applied: 13 Jan 2026
                            </Text>
                        </Card.Content>
                    </Card>                    
                </View>

            <FAB icon="plus" style={{position: "absolute", right: 20, bottom: 20 }} onPress={() => {}}/>
            {/* FAB is Floating Add Button, useful for screen scrolling while adding a row */}

            </View>
        </SafeAreaView>
    );
}