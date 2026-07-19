import { SectionTabs } from '@/components/home/section-tabs';
import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Màu các tuần theo Figma — nên chuyển vào Design.colors khi ổn định
const WEEKS = [
    { id: 1, color: '#F2B544' },
    { id: 2, color: '#EE6A6A' },
    { id: 3, color: '#3B8157' },
    { id: 4, color: '#4A90D9' },
] as const;

export default function CinemaScreen() {
    const [query, setQuery] = useState('');

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Quay lại"
                    hitSlop={8}
                    onPress={() => router.back()}
                    style={styles.backButton}>
                    <Ionicons color={Design.colors.black} name="chevron-back" size={24} />
                </Pressable>

                <SectionTabs active="cinema" />

                <Text style={styles.title}>PENTAVA-CINEMA</Text>

                <View style={styles.searchBar}>
                    <Ionicons color={Design.colors.mutedText} name="search-outline" size={16} />
                    <TextInput
                        onChangeText={setQuery}
                        placeholder="Tìm kiếm"
                        placeholderTextColor={Design.colors.disabled}
                        style={styles.searchInput}
                        value={query}
                    />
                    <Ionicons color={Design.colors.mutedText} name="options-outline" size={16} />
                </View>
            </View>

            <View style={styles.weekStack}>
                {WEEKS.map((week, index) => (
                    <Pressable
                        accessibilityRole="button"
                        key={week.id}
                        onPress={() =>
                            router.push({ pathname: '/week/[id]', params: { id: String(week.id) } })
                        }
                        style={[
                            styles.weekCard,
                            { backgroundColor: week.color },
                            index > 0 && styles.weekCardOverlap,
                        ]}
                    >
                        <Text style={styles.weekTitle}>WEEK {week.id}</Text>
                        <Ionicons color={Design.colors.white} name="chevron-forward" size={22} />
                    </Pressable>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Design.colors.white,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    backButton: {
        marginBottom: 10,
    },
    title: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: Design.fontSize.h2 - 2,
        color: Design.colors.black,
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 14,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: 20,
        paddingHorizontal: 14,
        height: 40,
        marginBottom: 18,
    },
    searchInput: {
        flex: 1,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
        paddingVertical: 0,
    },
    weekStack: {
        flex: 1,
    },
    weekCard: {
        flex: 1,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 26,
        paddingTop: 22,
    },
    weekCardOverlap: {
        marginTop: -30,
    },
    weekTitle: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.white,
        letterSpacing: 1,
    },
    weekTitleWrap: {},
});