import { getAccessToken } from '@/src/services/apiClient';
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href={getAccessToken() ? '/(tabs)' : '/login'} />;
}
