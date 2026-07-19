import { Design, FontFamily } from '@/constants/design';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SectionTabsProps = {
    active: 'tasks' | 'cinema';
};

export function SectionTabs({ active }: SectionTabsProps) {
    return (
        <View style={styles.container}>
            <Pressable
                accessibilityRole="button"
                disabled={active === 'tasks'}
                onPress={() => router.replace('/daily-tasks')}
                style={[styles.tab, active === 'tasks' && styles.tabActive]}>
                <Text style={[styles.tabText, active === 'tasks' && styles.tabTextActive]}>
                    Nhiệm vụ ngày
                </Text>
            </Pressable>
            <Pressable
                accessibilityRole="button"
                disabled={active === 'cinema'}
                onPress={() => router.replace('/cinema')}
                style={[styles.tab, active === 'cinema' && styles.tabActive]}>
                <Text style={[styles.tabText, active === 'cinema' && styles.tabTextActive]}>
                    PENTA-CINEMA
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignSelf: 'center',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        backgroundColor: '#F5F5F5',
        padding: 3,
        marginBottom: 18,
    },
    tab: {
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 7,
    },
    tabActive: {
        backgroundColor: Design.colors.white,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    tabText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.mutedText,
    },
    tabTextActive: {
        color: Design.colors.black,
    },
});