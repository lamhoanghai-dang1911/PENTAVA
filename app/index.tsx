import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/auth-context';

export default function Index() {
  const { status } = useAuth();
  return <Redirect href={status === 'authenticated' ? '/(tabs)' : '/login'} />;
}
