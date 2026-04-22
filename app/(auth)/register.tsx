import { db } from '@/db/client';
import { categoriesTable, usersTable } from '@/db/schema';
import bcrypt from '@/utils/passwordcrypto';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import FormField from '@/components/ui/form-field';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const router = useRouter();
    const theme = useTheme();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');   
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError('');

        // Adding constraints to the input fields
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
            setError('All fields are required.');
            return;
        }

        if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
        }

        // Password complexity will be added later...
        if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
        }

        setLoading(true);


        // Handling the inputs
        try {
            // If email already exists in the table
            const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLocaleLowerCase()));
            
            if (existing.length > 0) {
                setError('An account with this email already exists.');
                setLoading(false);
                return;
            }

            // Begin to hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Finally, insert the details in the table
            const newUserRows = await db.insert(usersTable).values({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                passwordhashed: passwordHash,
                createdAt: new Date().toISOString(),
            }).returning();

            // Seed default categories for the new user
            await db.insert(categoriesTable).values([
                { userId: newUserRows[0].id, name: 'Tech', color: '#3B82F6' },
                { userId: newUserRows[0].id, name: 'Finance', color: '#10B981' },
                { userId: newUserRows[0].id, name: 'Marketing', color: '#F59E0B' },
                { userId: newUserRows[0].id, name: 'Design', color: '#8B5CF6' },
            ]);

            router.replace('/login');
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Image
            source={require('@/assets/images/Sauron-Brand-Icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="displaySmall" style={{ fontFamily: 'Times New Roman', fontWeight: 'bold', color: theme.colors.onBackground }}>
            Sauron
          </Text>
        </View>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onBackground, fontFamily: 'Times New Roman' }]}>
          Create an account
        </Text>

        <FormField label="First Name" value={firstName} onChangeText={setFirstName} />

        <FormField label="Last Name" value={lastName} onChangeText={setLastName} />

        <FormField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

        <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <FormField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

        <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading}
          style={styles.button} accessibilityLabel="Create your account"
        >
          Register
        </Button>

        <Button mode="text" onPress={() => router.replace('/(auth)/login')} style={styles.link} accessibilityLabel="Go to login screen">
          Already have an account? Log in
        </Button>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logo: { width: 100, height: 100 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  error: { marginBottom: 12, fontSize: 14 },
  button: { marginTop: 8 },
  link: { marginTop: 12 },
});