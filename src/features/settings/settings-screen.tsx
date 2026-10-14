import { useAppTheme } from '@/src/context/theme-context';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountModal } from './components/account-modal';
import { SettingsHeader } from './components/settings-header';
import { SettingsMenuList } from './components/settings-menu-list';
import { SettingsProfileCard } from './components/settings-profile-card';
import { SettingsSkeleton } from './components/settings-skeleton';
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
  const { isNight } = useAppTheme();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: isNight ? '#0B132B' : '#FFFFFF' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SettingsHeader isNight={isNight} />

        {/* Profile Card & Menu List */}
        {loadingProfile && !profile ? (
          <SettingsSkeleton />
        ) : (
          <>
            <SettingsProfileCard
              avatarLoadFailed={avatarLoadFailed}
              avatarUrl={avatarUrl}
              isNight={isNight}
              onAvatarError={() => setAvatarLoadFailed(true)}
              onOpenSocialProfile={() => router.push('/social-profile?me=true')}
              profile={profile}
            />

            <SettingsMenuList
              isNight={isNight}
              items={MENU_ITEMS}
              onSelect={handleMenuItemPress}
            />
          </>
        )}

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
      </ScrollView>
    </SafeAreaView>
  );
}
