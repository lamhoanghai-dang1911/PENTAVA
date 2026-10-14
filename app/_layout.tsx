import { OnboardingProvider } from '@/src/context/onboarding-context';
import { CinemaProgressProvider } from '@/src/context/cinema-progress-context';
import { AuthProvider, useAuth } from '@/src/context/auth-context';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/src/context/theme-context';
import { useAppFonts } from '@/src/hooks/use-app-fonts';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { HomeBottomBar, type BottomBarTab } from '@/src/features/home/components/home-bottom-bar';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableFreeze, enableScreens } from 'react-native-screens';

enableScreens(true);
enableFreeze(true);

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
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
            <AppThemeProvider>
              <RootLayoutInner />
            </AppThemeProvider>
          </CinemaProgressProvider>
        </OnboardingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutInner() {
  const { isNight } = useAppTheme();

  return (
    <NavThemeProvider value={isNight ? DarkTheme : DefaultTheme}>
      <RootStack />
      <StatusBar style={isNight ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

function RootStack() {
  const { status } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const firstSegment = segments[0] as string | undefined;
  const isPublicRoute =
    !firstSegment ||
    firstSegment === 'login' ||
    firstSegment === 'register' ||
    firstSegment === 'verify-otp';

  const { isNight } = useAppTheme();
  const [isImmersive, setIsImmersive] = useState(false);

  useEffect(() => {
    const subImmersive = DeviceEventEmitter.addListener('SET_IMMERSIVE_VIEW', (val: boolean) => {
      setIsImmersive(Boolean(val));
    });
    return () => {
      subImmersive.remove();
    };
  }, []);

  useEffect(() => {
    if (firstSegment !== '(tabs)' && firstSegment !== 'index') {
      setIsImmersive(false);
    }
  }, [firstSegment]);

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

  let activeTab: BottomBarTab = null;
  let isFooterRoute = false;

  if (status === 'authenticated') {
    if (firstSegment === '(tabs)' || firstSegment === 'index') {
      isFooterRoute = true;
      activeTab = 'home';
    } else if (firstSegment === 'shop') {
      isFooterRoute = true;
      activeTab = 'shop';
    } else if (firstSegment === 'wardrobe') {
      isFooterRoute = true;
      activeTab = 'wardrobe';
    } else if (firstSegment === 'community') {
      isFooterRoute = true;
      activeTab = 'community';
    } else if (firstSegment === 'settings') {
      isFooterRoute = true;
      activeTab = 'settings';
    } else if (firstSegment === 'ruby-topup') {
      isFooterRoute = true;
      activeTab = 'shop';
    } else if (firstSegment === 'daily-tasks' || firstSegment === 'cinema') {
      isFooterRoute = true;
      activeTab = null;
    }
  }

  const showBottomBar = isFooterRoute && !isImmersive;

  return (
    <View style={{ flex: 1, backgroundColor: isNight ? '#0B132B' : '#FFFFFF' }}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 160,
            freezeOnBlur: true,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="verify-otp" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="shop"
            options={({ route }) => ({
              animation: ((route.params as any)?.slide as any) || 'slide_from_left',
              animationDuration: 160,
            })}
          />
          <Stack.Screen
            name="wardrobe"
            options={({ route }) => ({
              animation: ((route.params as any)?.slide as any) || 'slide_from_left',
              animationDuration: 160,
            })}
          />
          <Stack.Screen
            name="(tabs)"
            options={({ route }) => ({
              animation: ((route.params as any)?.slide as any) || 'slide_from_left',
              animationDuration: 160,
            })}
          />
          <Stack.Screen
            name="community"
            options={({ route }) => ({
              animation: ((route.params as any)?.slide as any) || 'slide_from_right',
              animationDuration: 160,
            })}
          />
          <Stack.Screen
            name="settings"
            options={({ route }) => ({
              animation: ((route.params as any)?.slide as any) || 'slide_from_right',
              animationDuration: 160,
            })}
          />
          <Stack.Screen
            name="daily-tasks"
            options={{
              animation: 'fade',
              animationDuration: 140,
            }}
          />
          <Stack.Screen
            name="cinema"
            options={{
              animation: 'fade',
              animationDuration: 140,
            }}
          />
          <Stack.Screen
            name="ruby-topup"
            options={{
              animation: 'slide_from_left',
              animationDuration: 160,
            }}
          />
          <Stack.Screen name="mood" />
          <Stack.Screen name="custom-roadmap" />
          <Stack.Screen name="diary" />
          <Stack.Screen name="social-post" />
          <Stack.Screen name="social-profile" />
          <Stack.Screen name="friend-requests" />
          <Stack.Screen name="membership" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="payment-success" />
          <Stack.Screen name="payment-failed" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </View>
      {showBottomBar && (
        <HomeBottomBar
          activeTab={activeTab}
          isNight={isNight}
        />
      )}
    </View>
  );
}