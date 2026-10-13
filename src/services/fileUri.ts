// src/services/fileUri.ts
import { Platform } from 'react-native';

// Android decode URI thêm một lần, nên encode '%' -> '%25'
// để ra đúng tên thư mục thật trong cache của Expo Go (project @anonymous).
export function toAndroidSafeUri(uri: string): string {
    if (Platform.OS === 'android' && uri.startsWith('file://')) {
        return uri.replace(/%/g, '%25');
    }
    return uri;
}