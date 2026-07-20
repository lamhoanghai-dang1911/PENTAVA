import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/screen-container';

type MenuItem = {
    label: string;
    icon: string;
    path: '/membership' | null;
};

const MENU_ITEMS: MenuItem[] = [
    { label: 'Thông báo', icon: 'notifications-outline', path: null },
    { label: 'Quyền riêng tư', icon: 'lock-closed-outline', path: null },
    { label: 'Tài khoản', icon: 'person-outline', path: null },
    { label: 'Thành viên', icon: 'trophy-outline', path: '/membership' },
    { label: 'Thống kê', icon: 'bar-chart-outline', path: null },
    { label: 'Đăng xuất', icon: 'log-out-outline', path: null },
];

export default function SettingsScreen() {
    const router = useRouter();

    return (
        <ScreenContainer scrollable contentStyle={styles.container}>
            {/* Header with Back Button and Title */}
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={Design.colors.primaryGreen} />
                </Pressable>
                <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
            </View>

            {/* Profile Card with Cat Avatar */}
            <View style={styles.profileCard}>
                <Image
                    source={require('@/assets/images/onboarding/cat-luna.png')}
                    style={styles.avatarImage}
                />
                <View style={styles.profileInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.profileName}>Xuân</Text>
                        <Ionicons name="briefcase-outline" size={20} color={Design.colors.black} />
                    </View>
                    <View style={styles.levelBadge}>
                        <Text style={styles.starIcon}>⭐</Text>
                        <Text style={styles.profileLevel}>Level 3</Text>
                    </View>
                    <Text style={styles.profileId}>Id: 239035232 ❏</Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📋</Text>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Task</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>💎</Text>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Ruby</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>▶️</Text>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Video</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🏅</Text>
                    <Text style={styles.statNumber}>40</Text>
                    <Text style={styles.statLabel}>Điểm</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📖</Text>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Nhật ký</Text>
                </View>
            </View>

            {/* Menu List */}
            <View style={styles.menuSectionHeader}>
                <Text style={styles.sectionTitle}>Cài đặt</Text>
            </View>
            <View style={styles.menuCard}>
                {MENU_ITEMS.map((item) => (
                    <Pressable
                        key={item.label}
                        accessibilityRole="button"
                        onPress={() => item.path && router.push(item.path as any)}
                        style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                    >
                        <View style={styles.menuLeft}>
                            <Ionicons name={item.icon as any} size={20} color={Design.colors.black} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Design.colors.mutedText} />
                    </Pressable>
                ))}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 22,
        color: Design.colors.black,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: Design.colors.white,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarImage: {
        width: 72,
        height: 72,
        borderRadius: 16,
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    profileName: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 18,
        color: Design.colors.black,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E7',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginBottom: 6,
    },
    starIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    profileLevel: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: 12,
        color: '#D48806',
    },
    profileId: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 11,
        color: Design.colors.mutedText,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: Design.colors.white,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
    },
    statIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    statNumber: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 18,
        color: Design.colors.black,
        marginBottom: 2,
    },
    statLabel: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 12,
        color: Design.colors.mutedText,
    },
    menuSectionHeader: {
        marginTop: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 18,
        color: Design.colors.black,
    },
    menuCard: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Design.colors.white,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: Design.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuItemPressed: {
        backgroundColor: '#F8F9F8',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuLabel: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: 14,
        color: Design.colors.black,
    },
});