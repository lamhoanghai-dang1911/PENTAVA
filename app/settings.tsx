import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { setAccessToken } from '@/src/services/apiClient';
import { authService, Profile } from '@/src/services/authService';
import { clearCurrentUser, removeAccessToken } from '@/src/services/authStorage';
import { uploadAvatar } from '@/src/services/avatarService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

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
    const [profile, setProfile] = useState<Profile | null>(null);
    const [accountVisible, setAccountVisible] = useState(false);
    const [editing, setEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const [bio, setBio] = useState('');

    const loadProfile = async () => {
        try {
            const nextProfile = await authService.getProfile();
            setProfile(nextProfile);
            setName(nextProfile.name);
            setAvatarUrl(nextProfile.avatarUrl ?? '');
            setSelectedAvatarUri(null);
            setAvatarLoadFailed(false);
            setBio(nextProfile.bio ?? '');
        } catch (error) {
            Alert.alert('Không thể tải tài khoản', error instanceof Error ? error.message : 'Vui lòng thử lại.');
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            void loadProfile();
        }, 0);

        return () => clearTimeout(timeout);
    }, []);

    const openAccount = async () => {
        setAccountVisible(true);
        if (!profile) {
            setLoadingProfile(true);
            await loadProfile();
        }
    };

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên.');
            return;
        }

        setSavingProfile(true);
        try {
            const savedAvatarUrl = selectedAvatarUri && profile
                ? await uploadAvatar(selectedAvatarUri, profile.id)
                : avatarUrl.trim() || null;
            const updatedProfile = await authService.updateProfile({
                name: name.trim(),
                avatarUrl: savedAvatarUrl,
                bio: bio.trim() || null,
            });
            const profileWithAvatar = {
                ...updatedProfile,
                avatarUrl: updatedProfile.avatarUrl ?? savedAvatarUrl,
            };
            setProfile(profileWithAvatar);
            setName(profileWithAvatar.name);
            setAvatarUrl(profileWithAvatar.avatarUrl ?? '');
            setSelectedAvatarUri(null);
            setAvatarLoadFailed(false);
            setBio(updatedProfile.bio ?? '');
            setEditing(false);
            Alert.alert('Thành công', 'Thông tin tài khoản đã được cập nhật.');
        } catch (error) {
            Alert.alert('Không thể cập nhật', error instanceof Error ? error.message : 'Vui lòng thử lại.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh để chọn ảnh đại diện.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0]?.uri;
            if (selectedUri) {
                setSelectedAvatarUri(selectedUri);
                setAvatarLoadFailed(false);
            }
        }
    };

    const handleCancelEditing = () => {
        setEditing(false);
        setSelectedAvatarUri(null);
        setName(profile?.name ?? '');
        setAvatarUrl(profile?.avatarUrl ?? '');
        setBio(profile?.bio ?? '');
        setAvatarLoadFailed(false);
    };

    const handleCloseAccount = () => {
        if (savingProfile) return;
        handleCancelEditing();
        setAccountVisible(false);
    };

    const handleLogout = async () => {
        setAccessToken(null);
        await Promise.all([removeAccessToken(), clearCurrentUser()]);
        router.replace('/login');
    };

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
                    cachePolicy="none"
                    onError={() => setAvatarLoadFailed(true)}
                    source={avatarUrl && !avatarLoadFailed ? { uri: avatarUrl } : require('@/assets/images/onboarding/cat-luna.png')}
                    style={styles.avatarImage}
                />
                <Pressable
                    accessibilityLabel="Mở trang cá nhân của tôi"
                    accessibilityRole="button"
                    onPress={() => router.push('/social-profile?me=true')}
                    style={styles.profileInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.profileName}>{profile?.name ?? 'Đang tải...'}</Text>
                        {/* <Ionicons name="briefcase-outline" size={20} color={Design.colors.black} /> */}
                    </View>
                    <View style={styles.levelBadge}>
                        {/* <Text style={styles.starIcon}>⭐</Text> */}
                        {/* <Text style={styles.profileLevel}>Level 3</Text> */}
                    </View>
                    {/* <Text style={styles.profileId}>Id: 239035232 ❏</Text> */}
                </Pressable>
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
                {/* <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🏅</Text>
                    <Text style={styles.statNumber}>40</Text>
                    <Text style={styles.statLabel}>Điểm</Text>
                </View> */}
                {/* <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📖</Text>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Nhật ký</Text>
                </View> */}
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
                        onPress={() => {
                            if (item.label === 'Đăng xuất') {
                                void handleLogout();
                                return;
                            }

                            if (item.label === 'Tài khoản') {
                                void openAccount();
                                return;
                            }

                            if (item.path) router.push(item.path as any);
                        }}
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
            <Modal
                animationType="slide"
                onRequestClose={handleCloseAccount}
                transparent
                visible={accountVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.accountCard}>
                        <View style={styles.accountHeader}>
                            <Text style={styles.accountTitle}>Tài khoản</Text>
                            <Pressable disabled={savingProfile} onPress={handleCloseAccount}>
                                <Ionicons name="close" size={24} color={Design.colors.black} />
                            </Pressable>
                        </View>
                        {loadingProfile ? (
                            <ActivityIndicator color={Design.colors.primaryGreen} style={styles.loader} />
                        ) : profile ? (
                            <>
                                <View style={styles.accountAvatarWrapper}>
                                    <Pressable disabled={savingProfile} onPress={() => void handlePickAvatar()}>
                                        <Image
                                            cachePolicy="none"
                                            onError={() => setAvatarLoadFailed(true)}
                                            source={
                                                selectedAvatarUri
                                                    ? { uri: selectedAvatarUri }
                                                    : avatarUrl && !avatarLoadFailed
                                                        ? { uri: avatarUrl }
                                                        : require('@/assets/images/onboarding/cat-luna.png')
                                            }
                                            style={styles.accountAvatar}
                                        />
                                        {editing ? (
                                            <View style={styles.avatarEditBadge}>
                                                <Ionicons name="camera-outline" size={16} color={Design.colors.white} />
                                            </View>
                                        ) : null}
                                    </Pressable>
                                </View>
                                {editing ? (
                                    <>
                                        <Text style={styles.fieldLabel}>Tên</Text>
                                        <TextInput onChangeText={setName} style={styles.input} value={name} />
                                        <Pressable disabled={savingProfile} onPress={() => void handlePickAvatar()} style={styles.chooseAvatarButton}>
                                            <Ionicons name="image-outline" size={18} color={Design.colors.primaryGreen} />
                                            <Text style={styles.chooseAvatarText}>Chọn ảnh đại diện</Text>
                                        </Pressable>
                                        <Text style={styles.fieldLabel}>Tiểu sử</Text>
                                        <TextInput multiline onChangeText={setBio} style={[styles.input, styles.bioInput]} value={bio} />
                                        <Pressable disabled={savingProfile} onPress={() => void handleSaveProfile()} style={styles.primaryButton}>
                                            {savingProfile ? <ActivityIndicator color={Design.colors.white} /> : <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>}
                                        </Pressable>
                                        <Pressable disabled={savingProfile} onPress={handleCancelEditing} style={styles.cancelButton}>
                                            <Text style={styles.cancelButtonText}>Hủy</Text>
                                        </Pressable>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.detailName}>{profile.name}</Text>
                                        <Text style={styles.detailText}>Email: {profile.email}</Text>
                                        <Text style={styles.detailText}>ID: {profile.id}</Text>
                                        <Text style={styles.detailBio}>{profile.bio || 'Chưa có tiểu sử'}</Text>
                                        <Pressable onPress={() => setEditing(true)} style={styles.primaryButton}>
                                            <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
                                        </Pressable>
                                    </>
                                )}
                            </>
                        ) : null}
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    accountCard: {
        backgroundColor: Design.colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
    },
    accountHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    accountTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 20,
        color: Design.colors.black,
    },
    loader: {
        paddingVertical: 36,
    },
    accountAvatarWrapper: {
        alignItems: 'center',
        marginBottom: 12,
    },
    accountAvatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
    },
    avatarEditBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Design.colors.primaryGreen,
        borderWidth: 2,
        borderColor: Design.colors.white,
    },
    chooseAvatarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Design.colors.primaryGreen,
        borderRadius: 10,
        paddingVertical: 10,
        marginTop: 12,
    },
    chooseAvatarText: {
        fontFamily: FontFamily.beVietnamMedium,
        color: Design.colors.primaryGreen,
        fontSize: 14,
    },
    detailName: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 18,
        textAlign: 'center',
        color: Design.colors.black,
        marginBottom: 8,
    },
    detailText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 14,
        color: Design.colors.mutedText,
        marginBottom: 4,
    },
    detailBio: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 14,
        color: Design.colors.black,
        marginTop: 10,
        marginBottom: 18,
    },
    fieldLabel: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: 13,
        color: Design.colors.mutedText,
        marginTop: 8,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: Design.colors.inputBorder,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: FontFamily.beVietnamRegular,
        color: Design.colors.black,
    },
    bioInput: {
        minHeight: 72,
        textAlignVertical: 'top',
    },
    primaryButton: {
        alignItems: 'center',
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 12,
        marginTop: 16,
        paddingVertical: 13,
    },
    primaryButtonText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        color: Design.colors.white,
        fontSize: 14,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelButtonText: {
        fontFamily: FontFamily.beVietnamMedium,
        color: Design.colors.mutedText,
        fontSize: 14,
    },
});