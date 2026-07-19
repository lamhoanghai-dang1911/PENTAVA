import { Design, FontFamily } from '@/constants/design';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOADING_DURATION_MS = 2500;

export default function RouteLoadingScreen() {
    useEffect(() => {
        // TODO: sau này thay setTimeout bằng lời gọi API thật để tính lộ trình
        // từ dữ liệu phỏng vấn (useOnboarding().data), xong thì mới điều hướng.
        const timer = setTimeout(() => {
            router.replace('/onboarding/recovery');
        }, LOADING_DURATION_MS);

        return () => clearTimeout(timer);
    }, []);

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