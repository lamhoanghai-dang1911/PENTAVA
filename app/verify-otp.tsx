import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { setAccessToken } from '@/src/services/apiClient';
import { authService } from '@/src/services/authService';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams<{ email?: string }>();

    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        logoutAfterConfirm: false,
    });

    const router = useRouter();

    const emailValue =
        typeof email === 'string'
            ? email
            : '';

    const showModal = (title: string, message: string, logoutAfterConfirm = false) => {
        setModal({ visible: true, title, message, logoutAfterConfirm });
    };

    const handleModalConfirm = () => {
        const logoutAfterConfirm = modal.logoutAfterConfirm;
        setModal((current) => ({ ...current, visible: false }));

        if (logoutAfterConfirm) {
            setAccessToken(null);
            router.replace('/login');
        }
    };

    const handleVerifyOtp = async () => {
        const cleanOtp = otpCode.trim();

        if (!emailValue) {
            showModal('Lỗi', 'Không tìm thấy email cần xác thực.');
            return;
        }

        if (!/^\d{6}$/.test(cleanOtp)) {
            showModal('Lỗi', 'Vui lòng nhập chính xác mã OTP gồm 6 chữ số.');
            return;
        }

        try {
            setLoading(true);

            console.log('VERIFY OTP REQUEST:', {
                email: emailValue,
                otpCode: cleanOtp,
            });

            const result = await authService.verifyOtp({
                email: emailValue,
                otpCode: cleanOtp,
            });

            console.log('VERIFY OTP SUCCESS:', result);
            showModal(
                'Xác thực thành công',
                'Vui lòng đăng nhập lại để tiếp tục.',
                true
            );
        } catch (error: any) {
            console.log('VERIFY OTP ERROR:', error);
            showModal(
                'Xác thực thất bại',
                error?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!emailValue) {
            showModal('Lỗi', 'Không tìm thấy thông tin email.');
            return;
        }

        try {
            setResending(true);

            console.log('RESEND OTP REQUEST:', {
                email: emailValue,
            });

            const result = await authService.resendOtp(
                emailValue
            );

            console.log('RESEND OTP SUCCESS:', result);
            showModal(
                'Gửi lại mã thành công',
                result.data?.message ||
                result.message ||
                'Mã OTP mới đã được gửi lại vào email của bạn.'
            );
        } catch (error: any) {
            console.log('RESEND OTP ERROR:', error);
            showModal(
                'Gửi lại mã thất bại',
                error?.message || 'Không thể gửi lại mã OTP lúc này.'
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.headerTitle}>
                    Xác thực OTP
                </Text>

                <Text style={styles.instruction}>
                    Chúng tôi đã gửi mã xác thực 6 chữ số tới email:
                    {'\n'}

                    <Text style={styles.emailText}>
                        {emailValue}
                    </Text>
                </Text>

                <View style={styles.form}>
                    <PillTextInput
                        autoCapitalize="none"
                        keyboardType="number-pad"
                        maxLength={6}
                        onChangeText={(text) => {
                            const onlyNumber =
                                text.replace(/\D/g, '');

                            setOtpCode(onlyNumber);
                        }}
                        placeholder="Nhập mã OTP 6 số"
                        value={otpCode}
                    />
                </View>

                <PrimaryButton
                    label="Xác nhận OTP"
                    loading={loading}
                    onPress={handleVerifyOtp}
                    style={styles.verifyButton}
                />

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                        Không nhận được mã?{' '}
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ busy: resending, disabled: resending }}
                        onPress={handleResendOtp}
                        disabled={resending}
                    >
                        {resending ? (
                            <ActivityIndicator color={Design.colors.primaryGreen} size="small" />
                        ) : (
                            <Text style={styles.resendLink}>Gửi lại mã</Text>
                        )}
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
        paddingTop: 30,
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

    instruction: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body,
        color: Design.colors.black,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },

    emailText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        color: Design.colors.primaryGreen,
    },

    form: {
        width: '100%',
        maxWidth: Design.spacing.contentWidth,
        marginBottom: 24,
    },

    verifyButton: {
        width: '100%',
        maxWidth: Design.spacing.contentWidth,
        marginBottom: 16,
    },

    resendContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'center',
    },

    resendText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption,
        color: Design.colors.disabled,
    },

    resendLink: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption,
        color: Design.colors.primaryGreen,
    },
});