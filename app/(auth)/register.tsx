import { db } from '@/db/client';
import { usersTable } from '@/db/schema';
import bcrypt from '@/utils/passwordcrypto';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
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
            setError('Email and password are required.');
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
            await db.insert(usersTable).values({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                passwordhashed: passwordHash,
                createdAt: new Date().toISOString(),
            });

            router.replace('/login');
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Create Account
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onBackground }]}>
          Track your job applications
        </Text>

        <TextInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
        mode="outlined"
        style={styles.input}
        />

        <TextInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        mode="outlined"
        style={styles.input}
        />
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.link}
        >
          Already have an account? Log in
        </Button>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, paddingTop: 48 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  input: { marginBottom: 16 },
  error: { marginBottom: 12, fontSize: 14 },
  button: { marginTop: 8 },
  link: { marginTop: 12 },
});