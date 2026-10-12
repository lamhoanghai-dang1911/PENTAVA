import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        continueToOtp: false,
    });
    const router = useRouter();

    const showModal = (title: string, message: string, continueToOtp = false) => {
        setModal({ visible: true, title, message, continueToOtp });
    };

    const handleModalConfirm = () => {
        const continueToOtp = modal.continueToOtp;
        setModal((current) => ({ ...current, visible: false }));

        if (continueToOtp) {
            handleContinueToOtp();
        }
    };

    const handleRegister = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
            showModal('Thiếu thông tin', 'Vui lòng điền đầy đủ email và mật khẩu.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            showModal('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email.');
            return;
        }

        if (trimmedPassword.length < 6) {
            showModal('Mật khẩu không hợp lệ', 'Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (trimmedPassword !== trimmedConfirmPassword) {
            showModal('Mật khẩu không khớp', 'Mật khẩu xác nhận không giống mật khẩu mới.');
            return;
        }

        try {
            setLoading(true);

            const result = await authService.register({
                email: trimmedEmail,
                password: trimmedPassword,
                confirmPassword: trimmedConfirmPassword,
            });

            console.log('REGISTER SUCCESS:', result);
            setRegisteredEmail(result.data?.email || trimmedEmail);
            showModal(
                'Đăng ký thành công',
                result.data?.message ||
                result.message ||
                'Vui lòng kiểm tra email để nhận mã OTP xác thực.',
                true
            );
        } catch (error) {
            console.log('REGISTER ERROR:', error);
            showModal(
                'Đăng ký thất bại',
                error instanceof Error ? error.message : 'Đã có lỗi xảy ra.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleContinueToOtp = () => {
        router.push({
            pathname: '/verify-otp',
            params: { email: registeredEmail },
        });
    };

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
                                router.replace('/login');
                            }
                        }}
                        style={styles.backButton}>
                        <Ionicons color={Design.colors.black} name="arrow-back" size={22} />
                    </Pressable>
                </View>

                <View style={styles.headerArea}>
                    <Text style={styles.welcomeTitle}>TẠO TÀI KHOẢN MỚI</Text>
                    <Text style={styles.welcomeSubtitle}>Bắt đầu hành trình chuyển hóa cùng Pentava</Text>
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
                        placeholder="Mật khẩu (ít nhất 6 ký tự)"
                        showPasswordToggle
                        isPasswordVisible={isPasswordVisible}
                        onTogglePassword={() => setIsPasswordVisible((prev) => !prev)}
                        value={password}
                    />
                    <PillTextInput
                        onChangeText={setConfirmPassword}
                        placeholder="Xác nhận mật khẩu"
                        showPasswordToggle
                        isPasswordVisible={isConfirmPasswordVisible}
                        onTogglePassword={() => setIsConfirmPasswordVisible((prev) => !prev)}
                        value={confirmPassword}
                    />
                </View>

                <PrimaryButton
                    label="Đăng ký"
                    loading={loading}
                    onPress={handleRegister}
                    style={styles.registerButton}
                />

                <View style={styles.loginRow}>
                    <Text style={styles.loginPrompt}>Đã có tài khoản? </Text>
                    <Pressable
                        accessibilityRole="link"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => router.back()}
                        style={styles.loginPressable}>
                        <Text style={styles.loginAction}>Đăng nhập</Text>
                    </Pressable>
                </View>
            </ScrollView>
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
        gap: 14,
        marginBottom: 24,
    },
    registerButton: {
        width: '100%',
        maxWidth: Design.spacing.contentWidth,
        marginBottom: 16,
    },
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingVertical: 8,
    },
    loginPrompt: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 15,
        color: '#4B5563',
    },
    loginPressable: {
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    loginAction: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 15,
        color: Design.colors.primaryGreen,
        textDecorationLine: 'underline',
    },
});