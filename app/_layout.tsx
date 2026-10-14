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
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableFreeze, enableScreens } from 'react-native-screens';

enableScreens(true);
enableFreeze(true);

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
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
    !firstSegment ||
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
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 220,
        freezeOnBlur: true,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="daily-tasks"
        options={{
          animation: 'fade',
          animationDuration: 180,
        }}
      />
      <Stack.Screen
        name="cinema"
        options={{
          animation: 'fade',
          animationDuration: 180,
        }}
      />
      <Stack.Screen name="wardrobe" />
      <Stack.Screen name="community" />
      <Stack.Screen name="mood" />
      <Stack.Screen name="custom-roadmap" />
      <Stack.Screen name="diary" />
      <Stack.Screen name="social-post" />
      <Stack.Screen name="social-profile" />
      <Stack.Screen name="friend-requests" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="membership" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="ruby-topup" />
      <Stack.Screen name="payment-success" />
      <Stack.Screen name="payment-failed" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}