import { OnboardingProvider } from '@/src/context/onboarding-context';
import { CinemaProgressProvider } from '@/src/context/cinema-progress-context';
import { AuthProvider, useAuth } from '@/src/context/auth-context';
import { useAppFonts } from '@/src/hooks/use-app-fonts';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OnboardingProvider>
          <CinemaProgressProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <RootStack />
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </ThemeProvider>
          </CinemaProgressProvider>
        </OnboardingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { status } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const firstSegment = segments[0];
  const isPublicRoute =
    firstSegment === 'login' ||
    firstSegment === 'register' ||
    firstSegment === 'verify-otp';

  useEffect(() => {
    if (status === 'unauthenticated' && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isPublicRoute, router, status]);

  if (status === 'unauthenticated' && !isPublicRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="daily-tasks" options={{ animation: 'fade' }} />
      <Stack.Screen name="cinema" options={{ animation: 'fade' }} />
      <Stack.Screen name="social-post" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="social-profile" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="friend-requests" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="membership" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="payment" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ruby-topup" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="payment-success" options={{ animation: 'fade' }} />
      <Stack.Screen name="payment-failed" options={{ animation: 'fade' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}