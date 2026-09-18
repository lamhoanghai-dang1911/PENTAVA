import { DividerWithText } from '@/src/components/ui/divider-with-text';
import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { useLogin } from '@/src/features/auth/hooks/use-login';
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
