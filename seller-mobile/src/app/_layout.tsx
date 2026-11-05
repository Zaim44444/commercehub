import { useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { AuthProvider, useAuth } from '@/providers/auth-provider';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      void SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF9F6',
        }}
      >
        <ActivityIndicator size="large" color="#173E35" />
      </View>
    );
  }

  const isSeller = !!session?.user.roles.includes('Vendor');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSeller}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={isSeller}>
        <Stack.Screen name="(seller)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}