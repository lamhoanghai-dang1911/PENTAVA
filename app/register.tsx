import { PillTextInput } from '@/components/ui/pill-text-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Design, FontFamily } from '@/constants/design';
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
import { authService } from './services/authService';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
            return;
        }

        try {
            setLoading(true);
            // Gọi API đăng ký khớp với RegisterRequestDTO
            await authService.register({ name, email, password });

            Alert.alert('Thành công', 'Mã OTP xác thực đã được gửi về email của bạn.');
            // Chuyển sang màn hình xác thực OTP và truyền kèm email
            router.push({
                pathname: '/verify-otp',
                params: { email },
            });
        } catch (error: any) {
            Alert.alert('Đăng ký thất bại', error.message || 'Đã có lỗi xảy ra.');
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