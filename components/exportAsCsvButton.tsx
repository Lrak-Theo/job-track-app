// This function button contains the code for exporting the applications table as a csv
import { Application, ApplicationContext, Category } from '@/app/_layout';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import { useContext } from 'react';
import { IconButton } from 'react-native-paper';

export default function ExportButton() {
    const context = useContext(ApplicationContext);
    if (!context) return null;

    const { applications, categories } = context;

    const handleExport = async () => {
        const rows = applications.map((app: Application) => {
            const category = categories.find((c: Category) => c.id === app.categoryId);
            return {
                Company: app.jobCompany,
                Role: app.jobTitle,
                Status: app.status,
                Category: category?.name ?? '',
                'Date Applied': app.applyDate,
            };
        });

        const csv = Papa.unparse(rows);
        const fileUri = FileSystem.cacheDirectory + 'applications.csv';

        await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: 'utf8',
        });

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Applications',
            UTI: 'public.comma-seperated-values-text',
        });

    };

    return (
        <IconButton icon="export-variant"
            onPress={handleExport} accessibilityLabel="Export applications as CSV"/>
    );
}