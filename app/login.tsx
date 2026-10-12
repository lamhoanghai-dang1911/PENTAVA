import { DividerWithText } from '@/src/components/ui/divider-with-text';
import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { useLogin } from '@/src/features/auth/hooks/use-login';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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

export default function LoginScreen() {
  const router = useRouter();
  const {
    closeForgotPassword,
    confirmNewPassword,
    email,
    forgotEmail,
    forgotOtp,
    forgotStep,
    handleForgotPassword,
    handleGoogleLogin,
    handleLogin,
    handleModalConfirm,
    handleResetPassword,
    handleVerifyResetOtp,
    isConfirmNewPasswordVisible,
    isNewPasswordVisible,
    isPasswordVisible,
    loading,
    modal,
    newPassword,
    openForgotPassword,
    password,
    request,
    setConfirmNewPassword,
    setEmail,
    setForgotEmail,
    setForgotOtp,
    setIsConfirmNewPasswordVisible,
    setIsNewPasswordVisible,
    setIsPasswordVisible,
    setNewPassword,
    setPassword,
  } = useLogin();

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            style={styles.backButton}>
            <Ionicons color={Design.colors.black} name="arrow-back" size={22} />
          </Pressable>
        </View>

        <View style={styles.headerArea}>
          <Text style={styles.welcomeTitle}>CHÀO MỪNG TRỞ LẠI</Text>
          <Text style={styles.welcomeSubtitle}>Đăng nhập để tiếp tục hành trình của bạn</Text>
        </View>

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
          <Pressable
            accessibilityRole="link"
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            onPress={openForgotPassword}
            style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </Pressable>
        </View>

        <PrimaryButton
          label="Đăng nhập"
          loading={loading}
          onPress={handleLogin}
          style={styles.loginButton}
        />

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

        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>Chưa có tài khoản? </Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.push('/register')}
            style={styles.registerPressable}>
            <Text style={styles.registerAction}>Đăng ký ngay</Text>
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
  topBar: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerArea: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeTitle: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 26,
    color: Design.colors.black,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 14,
    color: Design.colors.mutedText,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    gap: 12,
    marginBottom: 20,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -2,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  forgotPasswordText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 13,
    color: Design.colors.mutedText,
  },
  loginButton: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    marginBottom: 16,
  },
  socialRow: {
    width: '100%',
    maxWidth: Design.spacing.contentWidth,
    marginTop: 20,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  registerPrompt: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 15,
    color: '#4B5563',
  },
  registerPressable: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  registerAction: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
    color: Design.colors.primaryGreen,
    textDecorationLine: 'underline',
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
