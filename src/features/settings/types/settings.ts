import type { Profile } from '@/src/services/authService';

export type MenuItem = {
  label: string;
  icon: string;
  path: '/membership' | null;
};

export type SettingsHeaderProps = {
  title?: string;
  onBack?: () => void;
};

export type SettingsProfileCardProps = {
  profile: Profile | null;
  avatarUrl: string;
  avatarLoadFailed: boolean;
  onAvatarError: () => void;
  onOpenSocialProfile: () => void;
};

export type SettingsMenuListProps = {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
};

export type AccountModalProps = {
  visible: boolean;
  loadingProfile: boolean;
  savingProfile: boolean;
  editing: boolean;
  profile: Profile | null;
  name: string;
  avatarUrl: string;
  selectedAvatarUri: string | null;
  avatarLoadFailed: boolean;
  bio: string;
  onClose: () => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveProfile: () => void;
  onPickAvatar: () => void;
  onAvatarError: () => void;
  onChangeName: (text: string) => void;
  onChangeBio: (text: string) => void;
};
