import { Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

{/* To be deleted... Only used for proof, user will need to set targets later */}
const seededTargets = [
    {id: 1, period: 'weekly', goalCount: 10, categoryId: null},
    {id: 2, period: 'monthly', goalCount: 30, categoryId: null},
];

export default function dashboard() {

    return (
        <SafeAreaView style={{ flex: 1, padding: 20}}>
            <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Targets</Text>
            {seededTargets.map(target => (
                <Card key={target.id} style={{ marginBottom: 10 }}>
                    <Card.Content>

                        <Text variant="labelMedium">
                            {target.period}
                        </Text>

                        <Text variant="titleMedium">
                            Goal: {target.goalCount} applications
                        </Text>

                    </Card.Content>
                </Card>
            ))}
        </SafeAreaView>
    );
}