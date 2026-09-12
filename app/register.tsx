import { PillTextInput } from '@/src/components/ui/pill-text-input';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { authService } from '@/src/services/authService';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            Alert.alert(
                'Thiếu thông tin',
                'Vui lòng điền đầy đủ họ tên, email và mật khẩu.'
            );
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            Alert.alert(
                'Email không hợp lệ',
                'Vui lòng nhập đúng định dạng email.'
            );
            return;
        }

        if (trimmedPassword.length < 6) {
            Alert.alert(
                'Mật khẩu không hợp lệ',
                'Mật khẩu phải có ít nhất 6 ký tự.'
            );
            return;
        }

        try {
            setLoading(true);

            const result = await authService.register({
                name: trimmedName,
                email: trimmedEmail,
                password: trimmedPassword,
            });

            console.log('REGISTER SUCCESS:', result);

            router.push({
                pathname: '/verify-otp',
                params: {
                    email: trimmedEmail,
                },
            });
        } catch (error) {
            console.log('REGISTER ERROR:', error);

            Alert.alert(
                'Đăng ký thất bại',
                error instanceof Error
                    ? error.message
                    : 'Đã có lỗi xảy ra.'
            );
        } finally {
            setLoading(false);
        }
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
                        autoCapitalize="words"
                        onChangeText={setName}
                        placeholder="Họ và tên"
                        value={name}
                    />
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
                </View>

                <PrimaryButton
                    label={loading ? "Đang xử lý..." : "Đăng ký"}
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