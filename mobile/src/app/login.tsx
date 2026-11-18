import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { signIn, error: sessionError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleLogin() {
    if (saving) return;

    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSaving(true);

    try {
      await signIn(email, password);
      // The protected navigator opens the shop automatically.
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.brand}>CommerceHub</Text>
            <Text style={styles.title}>Welcome back.</Text>
            <Text style={styles.subtitle}>
              Sign in to continue shopping.
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Email"
              placeholder="you@example.com"
              placeholderTextColor="#78716C"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!saving}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Password"
              placeholder="Enter your password"
              placeholderTextColor="#78716C"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={() => void handleLogin()}
              editable={!saving}
            />

            {!!(error || sessionError) && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error || sessionError}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => void handleLogin()}
              style={({ pressed }) => [
                styles.button,
                (pressed || saving) && styles.dimmed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>
            
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => router.push('/signup')}
              style={{ alignItems: 'center', paddingVertical: 18 }}
            >
              <Text
                style={{
                  color: '#173E35',
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                Don&apos;t have an account? Sign up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#FAF9F6' },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#173E35',
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1917',
  },
  subtitle: {
    fontSize: 15,
    color: '#78716C',
    marginTop: 8,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6D3D1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1C1917',
    marginBottom: 20,
  },
  error: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    minHeight: 52,
    backgroundColor: '#173E35',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dimmed: { opacity: 0.7 },
});