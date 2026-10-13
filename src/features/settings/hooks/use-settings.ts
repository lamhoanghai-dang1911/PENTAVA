import { setAccessToken } from '@/src/services/apiClient';
import { authService, type Profile } from '@/src/services/authService';
import { clearCurrentUser, removeAccessToken } from '@/src/services/authStorage';
import { uploadAvatar } from '@/src/services/avatarService';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import type { MenuItem } from '../types/settings';

export function useSettings() {
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
      Alert.alert(
        'Không thể tải tài khoản',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
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
      Alert.alert(
        'Không thể cập nhật',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cho phép ứng dụng truy cập thư viện ảnh để chọn ảnh đại diện.',
      );
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

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.label === 'Đăng xuất') {
      void handleLogout();
      return;
    }

    if (item.label === 'Tài khoản') {
      void openAccount();
      return;
    }

    if (item.label === 'Quyền riêng tư') {
      void Linking.openURL('https://pentava.online/privacy');
      return;
    }

    if (item.path) {
      router.push(item.path as any);
    }
  };

  return {
    profile,
    accountVisible,
    editing,
    loadingProfile,
    savingProfile,
    name,
    avatarUrl,
    selectedAvatarUri,
    avatarLoadFailed,
    bio,
    setName,
    setBio,
    setEditing,
    setAvatarLoadFailed,
    openAccount,
    handleSaveProfile,
    handlePickAvatar,
    handleCancelEditing,
    handleCloseAccount,
    handleLogout,
    handleMenuItemPress,
  };
}
