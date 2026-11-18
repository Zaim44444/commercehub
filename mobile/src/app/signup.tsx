import { useState } from 'react';
import { router } from 'expo-router';
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

type RegisterError = {
  message?: string;
  errors?:
    | { description?: string }[]
    | Record<string, string[]>;
};

function registrationError(data: RegisterError | null): string {
  const errors = data?.errors;

  if (Array.isArray(errors)) {
    const descriptions = errors
      .map((error) => error.description)
      .filter(Boolean);

    if (descriptions.length) {
      return descriptions.join('\n');
    }
  } else if (errors && typeof errors === 'object') {
    const descriptions = Object.values(errors)
      .flat()
      .filter((message) => typeof message === 'string');

    if (descriptions.length) {
      return descriptions.join('\n');
    }
  }

  return data?.message || 'Unable to create your account.';
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  async function handleSignup() {
    if (saving || created) return;

    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Enter your name, email, and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (
      password.length < 10 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError(
        'Use at least 10 characters, including uppercase, lowercase, a number, and a symbol.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!apiUrl) {
      setError('EXPO_PUBLIC_API_URL is missing from your mobile .env.');
      return;
    }

    setSaving(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/+$/, '')}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            confirmPassword,
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const data: RegisterError | null = await response
          .json()
          .catch(() => null);

        setError(
          response.status >= 500
            ? 'Registration is temporarily unavailable. Please try again.'
            : registrationError(data),
        );
        return;
      }

      setPassword('');
      setConfirmPassword('');
      setCreated(true);
    } catch (err) {
        console.error('Registration request failed:', err);
      
        setError(
          err instanceof Error
            ? `Registration failed: ${err.message}`
            : 'Registration request failed.',
        );
    } finally {
    clearTimeout(timeout);
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

            {created ? (
              <>
                <Text style={styles.title}>Account created.</Text>

                <Text style={styles.subtitle}>
                  Your account is ready. Sign in to start shopping.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace('/login')}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.dimmed,
                  ]}
                >
                  <Text style={styles.buttonText}>Go to sign in</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.title}>Create an account.</Text>

                <Text style={styles.subtitle}>
                  Join CommerceHub and start shopping.
                </Text>

                <Text style={styles.label}>Full name</Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Full name"
                  placeholder="Your full name"
                  placeholderTextColor="#78716C"
                  value={fullName}
                  onChangeText={setFullName}
                  autoComplete="name"
                  autoCapitalize="words"
                  maxLength={150}
                  editable={!saving}
                />

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
                  placeholder="Create a password"
                  placeholderTextColor="#78716C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  editable={!saving}
                />

                <Text style={styles.hint}>
                  At least 10 characters with uppercase, lowercase,
                  a number, and a symbol.
                </Text>

                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Confirm password"
                  placeholder="Enter your password again"
                  placeholderTextColor="#78716C"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  returnKeyType="go"
                  onSubmitEditing={() => void handleSignup()}
                  editable={!saving}
                />

                {!!error && (
                  <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                  </Text>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: saving, busy: saving }}
                  disabled={saving}
                  onPress={() => void handleSignup()}
                  style={({ pressed }) => [
                    styles.button,
                    (pressed || saving) && styles.dimmed,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Create account</Text>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={() => router.replace('/login')}
                  style={styles.loginLink}
                >
                  <Text style={styles.linkText}>
                    Already have an account? Sign in
                  </Text>
                </Pressable>
              </>
            )}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C1917',
  },
  subtitle: {
    fontSize: 15,
    color: '#78716C',
    marginTop: 8,
    marginBottom: 28,
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
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: '#78716C',
    marginTop: -12,
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
  loginLink: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  linkText: {
    color: '#173E35',
    fontSize: 14,
    fontWeight: '600',
  },
  dimmed: { opacity: 0.7 },
});