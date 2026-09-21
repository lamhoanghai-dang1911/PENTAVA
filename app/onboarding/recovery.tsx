import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { useOnboarding } from '@/src/context/onboarding-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RecoveryScreen() {
    const { submitResponse } = useOnboarding();
    const diagnostic = submitResponse?.diagnostic;

    return (
        <ScreenContainer>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Image
                        contentFit="contain"
                        source={require('@/assets/images/onboarding/cat-sparkle.png')}
                        style={styles.mascot}
                    />
                    <Text style={styles.eyebrow}>KẾT QUẢ KHẢO SÁT</Text>
                    <Text style={styles.title}>Điều gì đang ảnh hưởng đến bạn?</Text>
                    <View style={styles.summaryCard}>
                        <Text style={styles.sectionLabel}>TỔNG QUAN</Text>
                        <Text style={styles.message}>
                            {diagnostic?.summary || 'Đang tải kết quả khảo sát của bạn...'}
                        </Text>
                    </View>
                    <View style={styles.issuesSection}>
                        <Text style={styles.sectionLabel}>ĐIỂM CẦN LƯU Ý</Text>
                        {diagnostic?.topIssues.map((issue, index) => (
                            <View key={issue} style={styles.issueCard}>
                                <Text style={styles.issueNumber}>0{index + 1}</Text>
                                <Text style={styles.issue}>{issue}</Text>
                            </View>
                        ))}
                    </View>
                    
                </View>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push('/onboarding/character')}
                        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}>
                        <Text style={styles.ctaLabel}>Bắt đầu hành trình</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingTop: 18,
        paddingHorizontal: Design.spacing.screenHorizontal,
        paddingBottom: 20,
    },
    content: {
        flexGrow: 1,
    },
    mascot: {
        alignSelf: 'center',
        width: 132,
        height: 132,
        marginBottom: 14,
    },
    eyebrow: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 11,
        letterSpacing: 1.4,
        color: Design.colors.primaryGreen,
        textAlign: 'center',
        marginBottom: 8,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.h2 - 2,
        color: Design.colors.primaryGreen,
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: 22,
    },
    summaryCard: {
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#F3F7F4',
        borderLeftWidth: 4,
        borderLeftColor: Design.colors.primaryGreen,
    },
    sectionLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 11,
        letterSpacing: 1,
        color: Design.colors.primaryGreen,
        marginBottom: 9,
    },
    message: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.black,
        lineHeight: 23,
    },
    issuesSection: {
        marginTop: 26,
    },
    issueCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 15,
        paddingHorizontal: 16,
        marginTop: 10,
        borderRadius: 14,
        backgroundColor: Design.colors.white,
        borderWidth: 1,
        borderColor: '#DCE8DF',
    },
    issueNumber: {
        width: 30,
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.primaryGreen,
    },
    issue: {
        fontFamily: FontFamily.beVietnamRegular,
        color: Design.colors.black,
        fontSize: Design.fontSize.body - 2,
        lineHeight: 22,
        flex: 1,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 24,
        paddingBottom: 36,
    },
    ctaButton: {
        height: 52,
        borderRadius: Design.borderRadius.button,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        backgroundColor: Design.colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaButtonPressed: {
        opacity: 0.7,
    },
    ctaLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.primaryGreen,
    },
});
