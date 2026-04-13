import { Application, Category } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

type JobCardProp = {
    application: Application;
    category: Category;
    onPress: () => void;
}


export default function JobCard({ application, category, onPress }: JobCardProp) {
    const router = useRouter();
    const theme = useTheme();

    return (
        <Pressable onPress={onPress}>
            <View style={{ flex: 1, paddingTop: 16 }}>
            {/* The card of job row */}
                <Card style={{ marginBottom: 15, backgroundColor: theme.colors.surface }}>
                    <Card.Content>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                            {/* Becareful of trailing spaces in style={{" "}} as it can prevent the format from happening*/}
                            <Text>{application.jobCompany}</Text>
                        </View>

                        <Text style={{ marginTop: 3 }}>
                            {application.jobTitle}
                        </Text>

                        <Text style={{ marginTop: 3 }}>
                            {category.name}
                        </Text>

                        <Text style= {{ marginTop: 6, opacity: 0.6 }}>
                            {application.applyDate}
                        </Text>

                        <Text style= {{ marginTop: 6, opacity: 0.6 }}>
                            {application.status}
                        </Text>
                

                    </Card.Content>
                </Card>
            </View>
        </Pressable>

        );
}
