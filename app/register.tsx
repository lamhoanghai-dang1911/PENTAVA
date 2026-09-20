import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { authService } from '@/src/services/authService';
import { Image } from 'expo-image';
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
                <Text style={styles.headerTitle}>Đăng ký tài khoản</Text>

                <View style={styles.mascotWrapper}>
                    <Image
                        contentFit="contain"
                        source={require('@/assets/images/auth/mascot.png')}
                        style={styles.mascot}
                    />
                </View>

                <Text style={styles.greeting}>
                    Bắt đầu hành trình{'\n'}cùng bạn!!
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

                <View style={styles.linksRow}>
                    <Pressable accessibilityRole="link" onPress={() => router.back()}>
                        <Text style={styles.linkText}>
                            Đã có tài khoản? <Text style={styles.linkAccent}>Đăng nhập</Text>
                        </Text>
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
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.h2,
        color: Design.colors.black,
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 24,
    },
    responseBox: {
        width: '100%',
        maxWidth: Design.spacing.contentWidth,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 18,
    },
    successBox: {
        backgroundColor: '#EAF8EF',
        borderColor: Design.colors.primaryGreen,
    },
    errorBox: {
        backgroundColor: '#FFF1F1',
        borderColor: '#D64545',
    },
    responseText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    successText: {
        color: Design.colors.primaryGreen,
    },
    errorText: {
        color: '#B42318',
    },
    form: {
        width: '100%',
        maxWidth: Design.spacing.contentWidth,
        gap: 15,
        marginBottom: 24,
    },
    registerButton: {
        width: '100%',
        maxWidth: Design.spacing.contentWidth,
        marginBottom: 16,
    },
    linksRow: {
        width: '100%',
        maxWidth: Design.spacing.contentWidth,
        alignItems: 'center',
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
});