import { useRef, useState } from 'react';
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
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import Ionicons from '@expo/vector-icons/Ionicons';

function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#94A3B8"
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

function returnToProducts() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export default function CreateProductScreen() {
  const { session } = useAuth();
  const token = session?.accessToken;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function handleCreate() {
    if (savingRef.current) return;

    setError('');

    if (!token) {
      setError('Please sign in again.');
      return;
    }

    if (!name.trim()) {
      setError('Enter a product name.');
      return;
    }

    const priceText = price.trim();
    const priceNumber = Number(priceText);

    if (
      !/^\d+(\.\d{1,2})?$/.test(priceText) ||
      !Number.isFinite(priceNumber) ||
      priceNumber <= 0 ||
      !Number.isSafeInteger(Math.round(priceNumber * 100))
    ) {
      setError(
        'Enter a valid positive price with up to two decimal places.',
      );
      return;
    }

    const stockText = stock.trim();
    const stockNumber = Number(stockText);

    if (
      !/^\d+$/.test(stockText) ||
      !Number.isInteger(stockNumber) ||
      stockNumber > 2_147_483_647
    ) {
      setError('Enter a valid stock quantity of zero or more.');
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      await apiRequest(
        '/api/vendor/products',
        {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            price: priceNumber,
            stockQuantity: stockNumber,
          }),
        },
        token,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create product.',
      );
      return;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }

    returnToProducts();
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: '#FFFFFF' }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={returnToProducts}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </Pressable>

        <Text style={styles.headerTitle}>Add product</Text>
      </View>

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: '#F5F7FB' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        > 



          <View style={styles.card}>
            <Field
              label="Product name"
              placeholder="Wireless Mouse"
              value={name}
              onChangeText={setName}
              maxLength={150}
              editable={!saving}
            />

            <Field
              label="Description"
              placeholder="Describe your product"
              value={description}
              onChangeText={setDescription}
              maxLength={2000}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 130 }}
              editable={!saving}
            />

            <Field
              label="Price (RM)"
              placeholder="49.90"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              editable={!saving}
            />

            <Field
              label="Stock quantity"
              placeholder="20"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
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
              onPress={() => void handleCreate()}
              style={[
                styles.button,
                saving && styles.dimmed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save product</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
    fontSize: 16,
  },
  button: {
    minHeight: 50,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 22,
  },
  dimmed: {
    opacity: 0.5,
  },
});