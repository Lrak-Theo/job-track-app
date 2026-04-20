import { db } from '@/db/client';
import { usersTable } from '@/db/schema';
import bcrypt from '@/utils/passwordcrypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../_layout';

export default function LoginScreen() {

    const router = useRouter();
    const theme = useTheme();
    const authContext = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handling the input fields
    const handleLogin = async () => {
        setError('');

        if (!email.trim() || !password.trim()) {
        setError('Email and password are required.');
        return;
        }

        setLoading(true);

        try {
        
            const results = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase()));

            if (results.length === 0) {
                setError('No account found with that email.');
                setLoading(false);
                return;
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.passwordhashed);

            if (!passwordMatch) {
                setError('Incorrect password.');
                setLoading(false);
                return;
            }

            await AsyncStorage.setItem('session_user_id', String(user.id));
            authContext?.setCurrentUser({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            });
            await authContext?.loadUserData(user.id);
            router.replace('/' as any);

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
          Login to access the app
        </Text>

        <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none"
          keyboardType="email-address" mode="outlined" style={styles.input} accessibilityLabel="Email address"
        />

        <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry
          mode="outlined" style={styles.input} accessibilityLabel="Password"
        />

        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

        <Button
          mode="contained" onPress={handleLogin} loading={loading} disabled={loading}
          style={styles.button} accessibilityLabel="Log in to your account"
        >
          Log In
        </Button>

        <Button mode="text" onPress={() => router.replace('/(auth)/register')}
          style={styles.link} accessibilityLabel="Go to register screen"
        >
          Don't have an account? Register
        </Button>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, paddingTop: 80 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logo: { width: 100, height: 100 },
  subtitle: { marginBottom: 40, opacity: 0.7 },
  input: { marginBottom: 16 },
  error: { marginBottom: 12, fontSize: 14 },
  button: { marginTop: 8 },
  link: { marginTop: 12 },
});