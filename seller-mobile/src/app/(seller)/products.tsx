import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
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

import { BottomTabInset } from '@/constants/theme';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

type ProductsResponse = {
  items: Product[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

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

export default function ProductsScreen() {
  const { session } = useAuth();
  const token = session?.accessToken;

  const [data, setData] = useState<ProductsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');


  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!token) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError('');
      setData(null);

      apiRequest<ProductsResponse>(
        `/api/vendor/products?page=${page}&pageSize=20`,
        {},
        token,
      )
        .then((result) => {
          if (!active) return;

          const lastPage = Math.max(1, result.totalPages);

          if (page > lastPage) {
            setPage(lastPage);
            return;
          }

          setData(result);
        })
        .catch((error: unknown) => {
          if (active) {
            setLoadError(
              error instanceof Error
                ? error.message
                : 'Unable to load products.',
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [token, page, revision]),
  );

  if (!token) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.subtitle}>Please sign in again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>Your products</Text>
              <Text style={styles.subtitle}>
                Manage your store’s listings.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/product-create')}
              style={styles.button}
            >
              <Text style={styles.buttonText}>+ Add product</Text>
            </Pressable>
          </View>

          <View style={styles.header}>
            <Text style={styles.label}>
              {data ? `${data.totalCount} products` : 'Product list'}
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={() => setRevision((value) => value + 1)}
              style={loading && styles.dimmed}
            >
              <Text style={styles.link}>Refresh</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2563EB"
              style={{ marginVertical: 30 }}
            />
          ) : loadError ? (
            <View style={styles.card}>
              <Text accessibilityRole="alert" style={styles.error}>
                {loadError}
              </Text>
            </View>
          ) : data?.items.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No products yet</Text>
              <Text style={styles.subtitle}>
                Tap Add product to create your first listing.
              </Text>
            </View>
          ) : (
            data?.items.map((product) => (
              <View key={product.id} style={styles.card}>
                <View style={styles.header}>
                  <Text style={[styles.cardTitle, styles.heading]}>
                    {product.name}
                  </Text>

                  <Text
                    style={
                      product.isActive
                        ? styles.active
                        : styles.subtitle
                    }
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>

                {!!product.description && (
                  <Text style={styles.subtitle} numberOfLines={3}>
                    {product.description}
                  </Text>
                )}

                <Text style={styles.price}>
                  RM {product.price.toFixed(2)}
                </Text>

                <Text style={styles.subtitle}>
                  Stock: {product.stockQuantity}
                </Text>
              </View>
            ))
          )}

          {!loading && !loadError && data && (
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                disabled={page <= 1}
                onPress={() => setPage((value) => value - 1)}
                style={page <= 1 && styles.dimmed}
              >
                <Text style={styles.link}>Previous</Text>
              </Pressable>

              <Text style={styles.subtitle}>
                Page {page} of {Math.max(1, data.totalPages)}
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={page >= data.totalPages}
                onPress={() => setPage((value) => value + 1)}
                style={page >= data.totalPages && styles.dimmed}
              >
                <Text style={styles.link}>Next</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#F5F7FB' },
  content: {
    padding: 20,
    paddingBottom: BottomTabInset + 24,
    gap: 18,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heading: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5EAF2',
    gap: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  link: { color: '#2563EB', fontWeight: '700', paddingVertical: 10 },
  price: { fontSize: 22, fontWeight: '800', color: '#111827' },
  active: { color: '#047857', fontSize: 13, fontWeight: '700' },
  error: { color: '#B91C1C', lineHeight: 22 },
  success: { color: '#047857', fontWeight: '600' },
  dimmed: { opacity: 0.5 },
});