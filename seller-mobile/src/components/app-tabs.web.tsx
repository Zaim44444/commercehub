import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import type { ComponentProps, ReactNode } from 'react';

export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />

      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="dashboard" href="/" asChild>
            <TabButton>Dashboard</TabButton>
          </TabTrigger>

          <TabTrigger name="products" href="/products" asChild>
            <TabButton>Products</TabButton>
          </TabTrigger>

          <TabTrigger name="orders" href="/orders" asChild>
            <TabButton>Orders</TabButton>
          </TabTrigger>

          <TabTrigger name="store" href="/store" asChild>
            <TabButton>Store</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = Omit<
  ComponentProps<typeof Pressable>,
  'children'
> & {
  children?: ReactNode;
  isFocused?: boolean;
};

export function TabButton({
  children,
  isFocused,
  ...props
}: TabButtonProps) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        pressed && styles.pressed,
      ]}
    >
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}
      >
        <ThemedText
          type="small"
          themeColor={isFocused ? 'text' : 'textSecondary'}
        >
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}


export function CustomTabList({ children, ...props }: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView
        type="backgroundElement"
        style={styles.innerContainer}
      >
        <ThemedText type="smallBold" style={styles.brandText}>
          CommerceHub Seller
        </ThemedText>

        {children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});