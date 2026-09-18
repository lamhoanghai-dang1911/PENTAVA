import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { authService } from '@/src/services/authService';

WebBrowser.maybeCompleteAuthSession();

type ForgotStep = 'email' | 'otp' | 'password' | null;
type ModalAction = 'none' | 'login' | 'google';

type LoginModal = {
  visible: boolean;
  title: string;
  message: string;
  action: ModalAction;
  hasCompletedOnboarding: boolean;
};

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);
  const [forgotNextStep, setForgotNextStep] = useState<Exclude<ForgotStep, 'email' | null> | null>(null);
  const [modal, setModal] = useState<LoginModal>({
    visible: false,
    title: '',
    message: '',
    action: 'none',
    hasCompletedOnboarding: false,
  });

  const showModal = (
    title: string,
    message: string,
    action: ModalAction = 'none',
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
      showModal('Đăng nhập Google thất bại', error?.message || 'Không thể xác thực tài khoản Google.');
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

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      showModal('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.login({ email: trimmedEmail, password });
      showModal(
        'Đăng nhập thành công',
        result.data?.message || result.message || 'Chào mừng bạn quay trở lại.',
        'login',
        Boolean(result.data?.hasCompletedOnboarding),
      );
    } catch (error: any) {
      showModal('Đăng nhập thất bại', error?.message || 'Email hoặc mật khẩu không đúng.');
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
      showModal('Đăng nhập Google thất bại', response.error?.description || 'Google không thể xác thực tài khoản.');
    }
  };

  return {
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
  };
}
