import type { ThemeMode } from '@/src/hooks/use-day-night-theme';
import type { SocialNotification } from '@/src/services/socialService';
import type { AvatarLayer } from '@/src/types/api/skin';

export type HomeHeaderProps = {
  displayName: string;
  currentStreak: number;
  rubyBalance: number | null;
  isRubyBalanceLoading: boolean;
  isNight: boolean;
  themeMode: ThemeMode;
  isImmersiveView: boolean;
  unreadNotificationCount: number;
  onToggleImmersive: () => void;
  onToggleTheme: () => void;
  onCycleTheme: () => void;
  onToggleNotifications: () => void;
  onOpenSettings: () => void;
};

export type HomeAvatarStageProps = {
  avatarLayers: AvatarLayer[] | null;
  isImmersiveView: boolean;
};

export type HomeRoutineSectionProps = {
  goalId: number | null;
  isNight: boolean;
  isImmersiveView: boolean;
  onExitImmersive: () => void;
};

export type HomeBottomNavigationProps = {
  isNight: boolean;
  onOpenShop: () => void;
};

export type HomeNotificationsModalProps = {
  visible: boolean;
  unreadCount: number;
  notifications: SocialNotification[];
  error: string | null;
  onClose: () => void;
  onOpenFriendRequests: () => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (notification: SocialNotification) => void;
};
