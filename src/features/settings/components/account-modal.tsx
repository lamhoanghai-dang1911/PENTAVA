import { Design } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../settings.styles';
import type { AccountModalProps } from '../types/settings';

export function AccountModal({
  visible,
  loadingProfile,
  savingProfile,
  editing,
  profile,
  name,
  avatarUrl,
  selectedAvatarUri,
  avatarLoadFailed,
  bio,
  onClose,
  onStartEditing,
  onCancelEditing,
  onSaveProfile,
  onPickAvatar,
  onAvatarError,
  onChangeName,
  onChangeBio,
}: AccountModalProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isKeyboardOpen = keyboardHeight > 0;
  const avatarSource = selectedAvatarUri
    ? { uri: selectedAvatarUri }
    : avatarUrl && !avatarLoadFailed
      ? { uri: avatarUrl }
      : require('@/assets/images/default-avatar.png');

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.modalOverlay}>
        <Pressable
          accessibilityLabel="Đóng tài khoản"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.accountCard,
            {
              marginBottom: Platform.OS === 'android' ? keyboardHeight : 0,
              maxHeight: isKeyboardOpen ? '704%' : '85%',
            },
          ]}>
          <View style={styles.accountHeader}>
            <Text style={styles.accountTitle}>Tài khoản</Text>
            <Pressable disabled={savingProfile} onPress={onClose}>
              <Ionicons color={Design.colors.black} name="close" size={24} />
            </Pressable>
          </View>

          {loadingProfile ? (
            <ActivityIndicator color={Design.colors.primaryGreen} style={styles.loader} />
          ) : profile ? (
            <ScrollView
              contentContainerStyle={styles.accountScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.accountAvatarWrapper}>
                <Pressable disabled={savingProfile} onPress={onPickAvatar}>
                  <Image
                    cachePolicy="none"
                    onError={onAvatarError}
                    source={avatarSource}
                    style={styles.accountAvatar}
                  />
                  {editing ? (
                    <View style={styles.avatarEditBadge}>
                      <Ionicons color={Design.colors.white} name="camera-outline" size={16} />
                    </View>
                  ) : null}
                </Pressable>
              </View>

              {editing ? (
                <>
                  <Text style={styles.fieldLabel}>Tên</Text>
                  <TextInput
                    onChangeText={onChangeName}
                    style={styles.input}
                    value={name}
                  />

                  <Pressable
                    disabled={savingProfile}
                    onPress={onPickAvatar}
                    style={styles.chooseAvatarButton}>
                    <Ionicons color={Design.colors.primaryGreen} name="image-outline" size={18} />
                    <Text style={styles.chooseAvatarText}>Chọn ảnh đại diện</Text>
                  </Pressable>

                  <Text style={styles.fieldLabel}>Tiểu sử</Text>
                  <TextInput
                    multiline
                    onChangeText={onChangeBio}
                    style={[styles.input, styles.bioInput]}
                    value={bio}
                  />

                  <Pressable
                    disabled={savingProfile}
                    onPress={onSaveProfile}
                    style={styles.primaryButton}>
                    {savingProfile ? (
                      <ActivityIndicator color={Design.colors.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
                    )}
                  </Pressable>

                  <Pressable
                    disabled={savingProfile}
                    onPress={onCancelEditing}
                    style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.detailName}>{profile.name}</Text>
                  <Text style={styles.detailText}>Email: {profile.email}</Text>
                  <Text style={styles.detailText}>ID: {profile.id}</Text>
                  <Text style={styles.detailBio}>{profile.bio || 'Chưa có tiểu sử'}</Text>
                  <Pressable onPress={onStartEditing} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
