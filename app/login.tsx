import { DividerWithText } from '@/src/components/ui/divider-with-text';
import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import * as Google from 'expo-auth-session/providers/google';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { authService } from '@/src/services/authService';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cấu hình Google Auth Request với Client ID thực tế
  // const [request, response, promptAsync] = AuthSession.useAuthRequest({
  //   clientId: '957094127060-01oacpn01pt6s25iu541q9il6tn90b4j.apps.googleusercontent.com',
  //   scopes: ['profile', 'email'],
  //   redirectUri: AuthSession.makeRedirectUri({ scheme: 'your-app-scheme' }),
  // });

  // Bên trong component LoginScreen:
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '957094127060-01oacpn01pt6s25iu541q9il6tn90b4j.apps.googleusercontent.com',
  });

  // Xử lý kết quả trả về từ Google Login
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication, params } = response;
      const idToken = authentication?.idToken || params?.id_token;

      if (idToken) {
        handleBackendGoogleLogin(idToken);
      } else {
        Alert.alert('Đăng nhập Google', 'Không nhận được mã xác thực từ Google.');
      }
    }
  }, [response]);

  const handleBackendGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      const res = await authService.googleLogin(idToken);
      console.log('Google Token:', res.accessToken);
      router.replace('/mood');
    } catch (error: any) {
      Alert.alert('Đăng nhập Google thất bại', error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      console.log('Login Token:', response.accessToken);
      router.replace('/mood');
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      promptAsync();
    } else {
      Alert.alert('Đăng nhập', `Tính năng đăng nhập ${provider} sẽ được cập nhật sau.`);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Đăng nhập</Text>

        <View style={styles.mascotWrapper}>
          <Image
            contentFit="contain"
            source={require('@/assets/images/auth/mascot.png')}
            style={styles.mascot}
          />
        </View>

        <Text style={styles.greeting}>
          Chào mừng{'\n'}bạn trở lại!!
        </Text>

        <View style={styles.form}>
          <PillTextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            value={email}
          />
          <PillTextInput
            onChangeText={setPassword}
            placeholder="Mật khẩu"
            showPasswordToggle
            isPasswordVisible={isPasswordVisible}
            onTogglePassword={() => setIsPasswordVisible((prev) => !prev)}
            value={password}
          />
        </View>

        <PrimaryButton label="Đăng nhập" onPress={handleLogin} style={styles.loginButton} />

        <View style={styles.linksRow}>
          <Pressable accessibilityRole="link" onPress={() => Alert.alert('Quên mật khẩu', 'Tính năng sẽ được cập nhật sau.')}>
            <Text style={styles.linkText}>Quên mật khẩu?</Text>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>
              Chưa có tài khoản? <Text style={styles.linkAccent}>Đăng ký</Text>
            </Text>
          </Pressable>
        </View>

        <DividerWithText />

        <View style={styles.socialRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => handleSocialLogin('Facebook')}
            style={styles.socialButton}>
            <RNImage source={require('@/assets/images/auth/facebook.png')} style={styles.socialIcon} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => handleSocialLogin('Google')}
            style={styles.socialButton}>
            <RNImage source={require('@/assets/images/auth/google.png')} style={styles.socialIcon} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => handleSocialLogin('Apple')}
            style={styles.socialButtonWide}>
            <RNImage source={require('@/assets/images/auth/apple.png')} style={styles.appleIcon} />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 29,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerTitle: {
    alignSelf: 'flex-start',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
    color: Design.colors.black,
    marginBottom: 16,
  },
  mascotWrapper: {
    width: 172,
    height: 185,
    marginBottom: 8,
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.h2,
    color: Design.colors.black,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 24,
  },
  form: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    gap: 15,
    marginBottom: 24,
  },
  loginButton: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    marginBottom: 16,
  },
  linksRow: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  linkText: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    color: Design.colors.disabled,
  },
  linkAccent: {
    color: Design.colors.primaryGreen,
  },
  socialRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 46,
    height: 45,
    borderRadius: Design.borderRadius.social,
    borderWidth: 1,
    borderColor: Design.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonWide: {
    minWidth: 47,
    height: 48,
    borderRadius: Design.borderRadius.social,
    borderWidth: 1,
    borderColor: Design.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  appleIcon: {
    width: 29,
    height: 35,
  },
});