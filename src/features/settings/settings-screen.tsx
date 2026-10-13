import { ScreenContainer } from '@/src/components/ui/screen-container';
import { useRouter } from 'expo-router';
import React from 'react';
import { AccountModal } from './components/account-modal';
import { SettingsHeader } from './components/settings-header';
import { SettingsMenuList } from './components/settings-menu-list';
import { SettingsProfileCard } from './components/settings-profile-card';
import { MENU_ITEMS } from './constants';
import { useSettings } from './hooks/use-settings';
import { styles } from './settings.styles';

export default function SettingsScreen() {
  const router = useRouter();
  const {
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
    handleSaveProfile,
    handlePickAvatar,
    handleCancelEditing,
    handleCloseAccount,
    handleMenuItemPress,
  } = useSettings();

  return (
    <ScreenContainer contentStyle={styles.container} scrollable>
      {/* Header */}
      <SettingsHeader onBack={() => router.back()} />

      {/* Profile Card */}
      <SettingsProfileCard
        avatarLoadFailed={avatarLoadFailed}
        avatarUrl={avatarUrl}
        onAvatarError={() => setAvatarLoadFailed(true)}
        onOpenSocialProfile={() => router.push('/social-profile?me=true')}
        profile={profile}
      />

      {/* Menu List */}
      <SettingsMenuList
        items={MENU_ITEMS}
        onSelect={handleMenuItemPress}
      />

      {/* Account Details & Edit Modal */}
      <AccountModal
        avatarLoadFailed={avatarLoadFailed}
        avatarUrl={avatarUrl}
        bio={bio}
        editing={editing}
        loadingProfile={loadingProfile}
        name={name}
        onAvatarError={() => setAvatarLoadFailed(true)}
        onCancelEditing={handleCancelEditing}
        onChangeBio={setBio}
        onChangeName={setName}
        onClose={handleCloseAccount}
        onPickAvatar={() => void handlePickAvatar()}
        onSaveProfile={() => void handleSaveProfile()}
        onStartEditing={() => setEditing(true)}
        profile={profile}
        savingProfile={savingProfile}
        selectedAvatarUri={selectedAvatarUri}
        visible={accountVisible}
      />
    </ScreenContainer>
  );
}
