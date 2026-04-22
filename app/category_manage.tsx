import { categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Divider, IconButton, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../db/client';
import { ApplicationContext, AuthContext, Category } from './_layout';

const PRESET_COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EF4444', // red
    '#EC4899', // pink
    '#F97316', // orange
    '#14B8A6', // teal
    '#6366F1', // indigo
    '#84CC16', // lime
];

export default function CategoryManageScreen() {

    const router = useRouter();
    const context = useContext(ApplicationContext);
    const authContext = useContext(AuthContext);
    const theme = useTheme();

    const [dialogVisible, setDialogVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    if (!context || !authContext) return null;

    const { categories, setCategories, applications } = context;
    const currentUser = authContext.currentUser;

    const openAddDialog = () => {
        setEditingCategory(null);
        setName('');
        setSelectedColor(PRESET_COLORS[0]);
        setDialogVisible(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setSelectedColor(category.color);
        setDialogVisible(true);
    };

    const closeDialog = () => {
        setDialogVisible(false);
        setEditingCategory(null);
        setName('');
        setSelectedColor(PRESET_COLORS[0]);
    };

    const saveCategory = async () => {
        if (!name.trim() || !currentUser) return;

        if (editingCategory) {
            await db.update(categoriesTable)
                .set({ name: name.trim(), color: selectedColor })
                .where(eq(categoriesTable.id, editingCategory.id));
        } else {
            await db.insert(categoriesTable).values({
                userId: currentUser.id,
                name: name.trim(),
                color: selectedColor,
            });
        }

        const updated = await db.select().from(categoriesTable).where(eq(categoriesTable.userId, currentUser.id));
        setCategories(updated);
        closeDialog();
    };

    const deleteCategory = (category: Category) => {
        const inUse = applications.some(a => a.categoryId === category.id);

        if (inUse) {
            Alert.alert(
                'Cannot Delete Category',
                `"${category.name}" is being used by existing applications. Delete those applications first before removing this category.`,
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Delete Category',
            `Delete "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await db.delete(categoriesTable).where(eq(categoriesTable.id, category.id));
                        const updated = await db.select().from(categoriesTable).where(eq(categoriesTable.userId, currentUser!.id));
                        setCategories(updated);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
            <ScrollView style={{ padding: 20 }}>

                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <IconButton icon="arrow-left" onPress={() => router.back()} style={{ margin: 0 }} accessibilityLabel="Go back" />
                    <Text variant="headlineSmall" style={{ marginLeft: 8 }}>Manage Categories</Text>
                </View>

                {/* Category list */}
                {categories.map((category: Category) => (
                    <View key={category.id}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: category.color, marginRight: 12 }} />
                            <Text variant="bodyLarge" style={{ flex: 1 }}>{category.name}</Text>
                            <IconButton
                                icon="pencil-outline"
                                size={20}
                                onPress={() => openEditDialog(category)}
                                accessibilityLabel={`Edit ${category.name}`}
                                style={{ margin: 0 }}
                            />
                            <IconButton
                                icon="delete-outline"
                                size={20}
                                iconColor={theme.colors.error}
                                onPress={() => deleteCategory(category)}
                                accessibilityLabel={`Delete ${category.name}`}
                                style={{ margin: 0 }}
                            />
                        </View>
                        <Divider />
                    </View>
                ))}

                <Button
                    mode="contained-tonal"
                    icon="plus"
                    onPress={openAddDialog}
                    style={{ marginTop: 20 }}
                    accessibilityLabel="Add new category"
                >
                    Add Category
                </Button>

            </ScrollView>

            {/* Add / Edit Dialog */}
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={closeDialog}>
                    <Dialog.Title>{editingCategory ? 'Edit Category' : 'New Category'}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Name"
                            value={name}
                            onChangeText={setName}
                            style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
                            dense
                            accessibilityLabel="Category name"
                        />
                        <Text variant="labelSmall" style={{ marginBottom: 8, opacity: 0.6 }}>Color</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {PRESET_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    accessibilityLabel={`Select color ${color}`}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: color,
                                        borderWidth: selectedColor === color ? 3 : 0,
                                        borderColor: theme.colors.onBackground,
                                    }}
                                />
                            ))}
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={closeDialog}>Cancel</Button>
                        <Button onPress={saveCategory} disabled={!name.trim()}>Save</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}
