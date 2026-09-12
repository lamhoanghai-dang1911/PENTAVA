import { Design, FontFamily } from '@/src/constants/design';
import { useOnboarding } from '@/src/context/onboarding-context';
import { onboardingService } from '@/src/services/onboardingService';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PREVIOUS_STEP_ROUTE = '/onboarding/free-time';

export default function RouteLoadingScreen() {
    const { data, setSubmitResponse } = useOnboarding();

    useEffect(() => {
        let isActive = true;

        const submitOnboarding = async () => {
            try {
                const result = await onboardingService.submitFromContext(data);
                if (!isActive) return;

                if (!result) {
                    Alert.alert(
                        'Thiếu thông tin',
                        'Vui lòng hoàn thành tất cả câu hỏi onboarding.',
                        [{ text: 'OK', onPress: () => router.replace(PREVIOUS_STEP_ROUTE) }],
                    );
                    return;
                }

                setSubmitResponse(result);
                router.replace('/onboarding/recovery');
            } catch (error: any) {
                if (!isActive) return;

                Alert.alert(
                    'Không thể lưu onboarding',
                    error?.response?.data?.message || error.message || 'Đã có lỗi xảy ra.',
                    [{ text: 'Thử lại', onPress: () => router.replace(PREVIOUS_STEP_ROUTE) }],
                );
            }
        };

        void submitOnboarding();

        return () => {
            isActive = false;
        };
    }, [data, setSubmitResponse]);

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <View style={styles.container}>
                <Image
                    contentFit="contain"
                    source={require('@/assets/images/onboarding/cat-loading.png')}
                    style={styles.mascot}
                />
                <Text style={styles.title}>LOADING...</Text>
                <Text style={styles.subtitle}>
                    Đang tính toán lộ trình{'\n'}phù hợp với bạn
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Design.colors.primaryGreen,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Design.spacing.screenHorizontal,
    },
    mascot: {
        width: 180,
        height: 190,
        marginBottom: 28,
    },
    title: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: Design.fontSize.h2,
        color: Design.colors.white,
        letterSpacing: 1,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.white,
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.9,
    },
});