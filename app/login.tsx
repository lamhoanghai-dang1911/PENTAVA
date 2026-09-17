import { DividerWithText } from '@/src/components/ui/divider-with-text';
import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { authService } from '@/src/services/authService';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'password' | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);
  const [forgotNextStep, setForgotNextStep] = useState<'otp' | 'password' | null>(null);
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    action: 'none' as 'none' | 'login' | 'google',
    hasCompletedOnboarding: false,
  });
  const router = useRouter();

  const showModal = (
    title: string,
    message: string,
    action: 'none' | 'login' | 'google' = 'none',
    hasCompletedOnboarding = false,
  ) => {
    setModal({ visible: true, title, message, action, hasCompletedOnboarding });
  };

  const handleModalConfirm = () => {
    const { action, hasCompletedOnboarding } = modal;
    setModal((current) => ({ ...current, visible: false }));

    if (forgotNextStep) {
      setForgotStep(forgotNextStep);
      setForgotNextStep(null);
      return;
    }

    if (action === 'google' || action === 'login') {
      router.replace(hasCompletedOnboarding ? '/(tabs)' : '/onboarding/name');
    }
  };

  const openForgotPassword = () => {
    setForgotEmail(email.trim().toLowerCase());
    setForgotOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotStep('email');
  };

  const closeForgotPassword = () => {
    if (!loading) {
      setForgotStep(null);
    }
  };

  const handleForgotPassword = async () => {
    const emailToSend = forgotEmail.trim().toLowerCase();
    if (!emailToSend) {
      showModal('Thiếu thông tin', 'Vui lòng nhập email đã đăng ký.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword(emailToSend);
      setForgotEmail(emailToSend);
      setForgotStep(null);
      setForgotNextStep('otp');
      showModal('Đã gửi mã OTP', result.data?.message || result.message || 'Mã OTP đã được gửi đến email của bạn.');
    } catch (error: any) {
      showModal('Gửi OTP thất bại', error?.message || 'Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!forgotOtp.trim()) {
      showModal('Thiếu thông tin', 'Vui lòng nhập mã OTP trong email.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.verifyResetOtp({
        email: forgotEmail.trim().toLowerCase(),
        otpCode: forgotOtp.trim(),
      });
      const token = result.data?.resetToken;
      if (!token) {
        throw new Error('Máy chủ không trả về mã đặt lại mật khẩu.');
      }
      setResetToken(token);
      setForgotStep(null);
      setForgotNextStep('password');
      showModal('Xác thực thành công', result.data?.message || result.message || 'Vui lòng đặt mật khẩu mới.');
    } catch (error: any) {
      showModal('Xác thực OTP thất bại', error?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      showModal('Thiếu thông tin', 'Vui lòng nhập và xác nhận mật khẩu mới.');
      return;
    }
    if (newPassword.length < 6) {
      showModal('Mật khẩu chưa hợp lệ', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showModal('Mật khẩu không khớp', 'Mật khẩu xác nhận không giống mật khẩu mới.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.resetPassword({ resetToken, newPassword });
      setForgotStep(null);
      setForgotNextStep(null);
      setNewPassword('');
      setConfirmNewPassword('');
      showModal('Đặt lại mật khẩu thành công', result.data?.message || result.message || 'Vui lòng đăng nhập lại.');
    } catch (error: any) {
      showModal('Đặt lại mật khẩu thất bại', error?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackendGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      const result = await authService.googleLogin(idToken);
      const responseData = result.data ?? result;

      showModal(
        'Đăng nhập thành công',
        responseData.message || result.message || 'Chào mừng bạn quay trở lại.',
        'google',
        Boolean(responseData.hasCompletedOnboarding),
      );
    } catch (error: any) {
      showModal(
        'Đăng nhập Google thất bại',
        error?.message || 'Không thể xác thực tài khoản Google.',
      );
    } finally {
      setLoading(false);
    }
  };

  const [request, , promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    responseType: AuthSession.ResponseType.IdToken,
    shouldAutoExchangeCode: false,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  });
  console.log('REDIRECT URI:', request?.redirectUri);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      showModal(
        'Thiếu thông tin',
        'Vui lòng nhập email và mật khẩu.'
      );
      return;
    }

    try {
      setLoading(true);

      console.log('LOGIN REQUEST:', {
        email: trimmedEmail,
        password: '******',
      });

      const result = await authService.login({
        email: trimmedEmail,
        password: password,
      });

      console.log('LOGIN SUCCESS:', result);

      showModal(
        'Đăng nhập thành công',
        result.data?.message || result.message || 'Chào mừng bạn quay trở lại.',
        'login',
        Boolean(result.data?.hasCompletedOnboarding),
      );
    } catch (error: any) {
      console.log('LOGIN ERROR:', error);

      showModal(
        'Đăng nhập thất bại',
        error?.message ||
        'Email hoặc mật khẩu không đúng.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!request || loading) {
      showModal('Đăng nhập Google', 'Đang chuẩn bị đăng nhập Google. Vui lòng thử lại sau giây lát.');
      return;
    }

    const response = await promptAsync();
    if (response.type === 'success') {
      const idToken = response.authentication?.idToken || response.params?.id_token;

      if (!idToken) {
        showModal('Đăng nhập Google thất bại', 'Google không trả về idToken.');
        return;
      }

      await handleBackendGoogleLogin(idToken);
    } else if (response.type === 'error') {
      showModal(
        'Đăng nhập Google thất bại',
        response.error?.description || 'Google không thể xác thực tài khoản.',
      );
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

        <PrimaryButton
          label="Đăng nhập"
          loading={loading}
          onPress={handleLogin}
          style={styles.loginButton}
        />

        <View style={styles.linksRow}>
          <Pressable accessibilityRole="link" onPress={openForgotPassword}>
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
            disabled={!request || loading}
            onPress={handleGoogleLogin}
            style={styles.socialButton}>
            <Image contentFit="contain" source={require('@/assets/images/auth/google.png')} style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Đăng nhập bằng Google</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={closeForgotPassword}
        transparent
        visible={forgotStep !== null}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <View style={styles.forgotCard}>
            <Text style={styles.forgotTitle}>
              {forgotStep === 'email' ? 'Quên mật khẩu?' : forgotStep === 'otp' ? 'Nhập mã OTP' : 'Tạo mật khẩu mới'}
            </Text>
            <Text style={styles.forgotDescription}>
              {forgotStep === 'email'
                ? 'Nhập email đã đăng ký để nhận mã xác thực.'
                : forgotStep === 'otp'
                  ? `Mã OTP đã được gửi đến ${forgotEmail}.`
                  : 'Mật khẩu mới sẽ được dùng cho lần đăng nhập tiếp theo.'}
            </Text>
            {forgotStep === 'email' ? (
              <PillTextInput
                autoCapitalize="none"
                autoFocus
                keyboardType="email-address"
                onChangeText={setForgotEmail}
                placeholder="Email"
                value={forgotEmail}
              />
            ) : null}
            {forgotStep === 'otp' ? (
              <PillTextInput
                autoFocus
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={setForgotOtp}
                placeholder="Mã OTP"
                value={forgotOtp}
              />
            ) : null}
            {forgotStep === 'password' ? (
              <View style={styles.forgotInputs}>
                <PillTextInput
                  autoFocus
                  isPasswordVisible={isNewPasswordVisible}
                  onChangeText={setNewPassword}
                  placeholder="Mật khẩu mới"
                  onTogglePassword={() => setIsNewPasswordVisible((prev) => !prev)}
                  showPasswordToggle
                  value={newPassword}
                />
                <PillTextInput
                  isPasswordVisible={isConfirmNewPasswordVisible}
                  onChangeText={setConfirmNewPassword}
                  placeholder="Nhập lại mật khẩu mới"
                  onTogglePassword={() => setIsConfirmNewPasswordVisible((prev) => !prev)}
                  showPasswordToggle
                  value={confirmNewPassword}
                />
              </View>
            ) : null}
            <PrimaryButton
              label={forgotStep === 'email' ? 'Gửi mã OTP' : forgotStep === 'otp' ? 'Xác nhận OTP' : 'Đặt lại mật khẩu'}
              loading={loading}
              onPress={forgotStep === 'email' ? handleForgotPassword : forgotStep === 'otp' ? handleVerifyResetOtp : handleResetPassword}
              style={styles.forgotButton}
            />
            <Pressable accessibilityRole="button" disabled={loading} onPress={closeForgotPassword}>
              <Text style={styles.cancelText}>Hủy</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <NotificationModal
        message={modal.message}
        onConfirm={handleModalConfirm}
        title={modal.title}
        visible={modal.visible}
      />
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
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    marginTop: 20,
  },
  socialButton: {
    width: '100%',
    height: 54,
    borderRadius: Design.borderRadius.social,
    borderWidth: 1,
    borderColor: Design.colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  socialButtonText: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  forgotCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 22,
    backgroundColor: Design.colors.white,
  },
  forgotTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotDescription: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.body,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  forgotInputs: {
    gap: 12,
  },
  forgotButton: {
    width: '100%',
    marginTop: 18,
    marginBottom: 12,
  },
  cancelText: {
    color: Design.colors.disabled,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.body,
    textAlign: 'center',
    paddingVertical: 8,
  },
});