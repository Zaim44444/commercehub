import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

type Props = {
  title: string;
  description: string;
};

export default function SellerPlaceholder({ title, description }: Props) {
  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: BottomTabInset + 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 400,
  },
});