import { Application, Category } from '@/app/_layout';
import { Pressable, View } from 'react-native';
import { Card, Chip, Icon, Text, useTheme } from 'react-native-paper';


type JobCardProp = {
    application: Application;
    category: Category;
    onPress: () => void;
}


export default function JobCard({ application, category, onPress }: JobCardProp) {
    const theme = useTheme();

    return (
        <Pressable onPress={onPress} accessibilityLabel={`${application.jobTitle} at ${application.jobCompany}`}>
            <View style={{ flex: 1 }}>
            {/* The card of job row */}
                <Card style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}>
                    <Card.Content>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                            <Text variant="titleMedium">{application.jobCompany}</Text>
                            {application.notes ? (
                                <Icon source="note-text-outline" size={16} color={theme.colors.primary} />
                            ) : null}
                        </View>

                        <Text variant="bodyMedium" style={{ marginTop: 2 }}>
                            {application.jobTitle}
                        </Text>

                        {/* Category dot + name */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: category.color }} />
                            <Text variant="bodySmall" style={{ opacity: 0.6 }}>{category.name}</Text>
                        </View>

                        {/* Date + status on the same row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                                {application.applyDate}
                            </Text>
                            <Chip
                                compact
                                accessibilityLabel={`Status: ${application.status}`}
                                style={{ backgroundColor: theme.colors.secondary }}
                                textStyle={{ color: '#584B53', fontSize: 11, fontWeight: 'bold' }}
                            >
                                {application.status}
                            </Chip>
                        </View>

                    </Card.Content>
                </Card>
            </View>
        </Pressable>

        );
}
