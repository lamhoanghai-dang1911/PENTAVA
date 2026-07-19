import { OnboardingProvider } from '@/context/onboarding-context';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="name" />
        <Stack.Screen name="gender-age" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="routine" />
        <Stack.Screen name="sleep" />
        <Stack.Screen name="exercise" />
        <Stack.Screen name="stress" />
        <Stack.Screen name="screen-time" />
        <Stack.Screen name="habit" />
        <Stack.Screen name="free-time" />
        <Stack.Screen name="route-loading" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="recovery" options={{ animation: 'fade' }} />
        <Stack.Screen name="character" />
      </Stack>
    </OnboardingProvider>
  );
}