import { PrimaryButton } from '@/components/ui/primary-button';
import { DividerWithText } from '@/components/ui/divider-with-text';
import { PillTextInput } from '@/components/ui/pill-text-input';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Design, FontFamily } from '@/constants/design';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image as RNImage,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    router.replace('/(tabs)');
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Đăng nhập', `Tính năng đăng nhập ${provider} sẽ được cập nhật sau.`);
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
          <Pressable accessibilityRole="link" onPress={() => router.push('/onboarding/name')}>
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
