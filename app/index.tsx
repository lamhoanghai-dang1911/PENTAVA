import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/auth-context';
import { KickOffScreen } from '@/src/features/kick-off/kick-off-screen';

export default function Index() {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return <KickOffScreen />;
}
