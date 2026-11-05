import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

const stats = [
  { label: 'Sales today', value: 'RM 0.00' },
  { label: 'New orders', value: '0' },
  { label: 'Active products', value: '0' },
  { label: 'To ship', value: '0' },
];

export default function SellerDashboardScreen() {
  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.brand}>COMMERCEHUB SELLER</Text>
            <Text style={styles.title}>Your store overview</Text>
            <Text style={styles.subtitle}>
              Keep track of your sales, products, and orders.
            </Text>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Let’s get your store ready</Text>
            <Text style={styles.noticeText}>
              Your store activity will appear here once you start selling.
            </Text>
          </View>

          <View style={styles.stats}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent orders</Text>

            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyDescription}>
                New customer orders will appear here.
              </Text>
            </View>
          </View>

          <Text style={styles.previewNote}>
            Preview dashboard · Sample values
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: BottomTabInset + 24,
  },
  content: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    gap: 24,
  },
  header: {
    gap: 8,
  },
  brand: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 23,
  },
  notice: {
    backgroundColor: '#EAF1FF',
    borderRadius: 18,
    padding: 20,
    gap: 8,
  },
  noticeTitle: {
    color: '#1E40AF',
    fontSize: 17,
    fontWeight: '700',
  },
  noticeText: {
    color: '#365687',
    fontSize: 14,
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5EAF2',
    gap: 12,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  statValue: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '800',
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 19,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    gap: 8,
  },
  emptyTitle: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDescription: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  previewNote: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});