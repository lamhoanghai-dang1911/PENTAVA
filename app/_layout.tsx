import { OnboardingProvider } from '@/src/context/onboarding-context';
import { useAppFonts } from '@/src/hooks/use-app-fonts';
import { restoreAccessToken } from '@/src/services/apiClient';
import { Stack } from 'expo-router';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useAppFonts();
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    restoreAccessToken().finally(() => setAuthLoaded(true));
  }, []);

  if (!fontsLoaded || !authLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="daily-tasks" options={{ animation: 'none' }} />
            <Stack.Screen name="cinema" options={{ animation: 'none' }} />
            <Stack.Screen name="settings" />
            <Stack.Screen name="membership" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="payment-success" />
            <Stack.Screen name="payment-failed" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}